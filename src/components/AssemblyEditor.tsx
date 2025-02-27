import { useState, useEffect, useRef } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { Assembler, expandPseudoInstruction } from '../assembler/assembler';
import { InstructionFormatPanel } from './InstructionFormatPanel';
import Editor, { useMonaco } from '@monaco-editor/react';

export function AssemblyEditor() {
  const [error, setError] = useState<string | null>(null);
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const monaco = useMonaco();
  
  // 使用store中的状态
  const editorCode = useCircuitStore((state) => state.editorCode);
  const setEditorCode = useCircuitStore((state) => state.setEditorCode);
  const assembledInstructions = useCircuitStore((state) => state.assembledInstructions);
  const setAssembledInstructions = useCircuitStore((state) => state.setAssembledInstructions);
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useCircuitStore((state) => state.nodes);
  const currentInstructionIndex = useCircuitStore((state) => state.currentInstructionIndex);

  // 保存编辑器实例的引用
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  // 映射指令索引到源代码行号
  const getSourceLineFromInstructionIndex = (index: number) => {
    if (!editorCode || index === null || index < 0 || index >= assembledInstructions.length) {
      return -1;
    }
    
    const sourceLines = editorCode.split('\n');
    let currentLine = 0;
    let currentInstructionCount = 0;
    
    for (let i = 0; i < sourceLines.length; i++) {
      const line = sourceLines[i].split('#')[0].trim();
      if (line && !line.endsWith(':')) {
        // 获取当前行展开后的指令数量
        const expandedInsts = expandPseudoInstruction(line);
        currentInstructionCount += expandedInsts.length;
        
        // 判断当前指令索引是否在这一行的范围内
        if (index < currentInstructionCount) {
          return i;
        }
      }
    }
    
    return -1;
  };

  // 监听指令索引变化，自动滚动到高亮行
  useEffect(() => {
    // 表格部分的高亮滚动
    if (tableBodyRef.current && currentInstructionIndex !== null && currentInstructionIndex >= 0) {
      const highlightedRow = tableBodyRef.current.querySelector(`tr:nth-child(${currentInstructionIndex + 1})`);
      if (highlightedRow) {
        highlightedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentInstructionIndex]);

  const assembleCode = () => {
    setError(null);
    useCircuitStore.getState().resetSimulation();
    try {
      const assemblerInstance = new Assembler();
      const instructions = assemblerInstance.assemble(editorCode);
      
      // 将代码按行分割并过滤掉注释和空行
      const assemblyLines = editorCode
        .split('\n')
        .map(line => {
          let trimmedLine = line.split('#')[0].trim();
          if (!trimmedLine || trimmedLine.endsWith(':')) return null;
          
          // 替换标签为地址
          Object.entries(assemblerInstance.getLabelMap()).forEach(([label, address]) => {
            const labelRegex = new RegExp(`\\b${label}\\b`, 'g');
            trimmedLine = trimmedLine.replace(labelRegex, `0x${address.toString(16).padStart(8, '0')}`);
          });
          
          // 格式化其他立即数
          trimmedLine = trimmedLine.replace(/\b0x[0-9a-fA-F]+\b/g, match => {
            const num = parseInt(match, 16);
            return `0x${num.toString(16).padStart(8, '0')}`;
          });
          
          return trimmedLine;
        })
        .filter(Boolean);
      
      // 将汇编指令与机器码对应
      const instructionsWithAssembly = instructions.map((inst, i) => {
        // 获取原始源代码行和展开后的指令
        const sourceLines = editorCode.split('\n');
        let sourceLine = '';
        let expandedInst = '';
        let currentLine = 0;
        let expandedInsts: string[] = [];
        let foundSource = false;
        
        for (let j = 0; j < sourceLines.length && !foundSource; j++) {
          const line = sourceLines[j].split('#')[0].trim();
          if (line && !line.endsWith(':')) {
            // 获取当前行展开后的指令数量
            expandedInsts = line ? expandPseudoInstruction(line) : [];
            const instructionIndex = Math.floor(i / expandedInsts.length);
            
            if (currentLine === instructionIndex) {
              sourceLine = sourceLines[j].trim();
              expandedInst = expandedInsts[i % expandedInsts.length] || '';
              
              // 替换分支指令中的标签为地址
              if (expandedInst) {
                Object.entries(assemblerInstance.getLabelMap()).forEach(([label, address]) => {
                  const labelRegex = new RegExp(`\\b${label}\\b`, 'g');
                  expandedInst = expandedInst.replace(labelRegex, `0x${address.toString(16).padStart(8, '0')}`);
                });
              }
              foundSource = true;
            }
            currentLine++;
          }
        }
        
        return {
          ...inst,
          assembly: expandedInst || '',
          source: sourceLine || '',
          sourceLineIndex: getSourceLineFromInstructionIndex(i)  // 保存源代码行号
        };
      });
      
      setAssembledInstructions(instructionsWithAssembly);

      // 找到指令内存节点并更新其数据
      const instructionMemoryNode = nodes.find(node => node.type === 'instruction-memory');
      if (instructionMemoryNode) {
        updateNodeData(instructionMemoryNode.id, {
          instructions: instructionsWithAssembly.map((inst: { hex: string }) => inst.hex),
          pc: 0
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('汇编过程中发生未知错误');
      }
    }
  };

  const loadTestProgram = async (programType: string) => {
    try {
      const response = await fetch(`/src/examples/test-programs/${programType}.s`);
      const programText = await response.text();
      setEditorCode(programText);
    } catch (err) {
      setError('加载示例程序失败');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-full">
        {/* 左侧编辑器部分 */}
        <div className="w-1/2 p-4 border-r border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">汇编代码编辑器</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.txt,.s';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const content = e.target?.result as string;
                        setEditorCode(content);
                      };
                      reader.readAsText(file);
                    }
                  };
                  input.click();
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                title="导入.txt或.s格式的汇编代码文件"
              >
                导入程序
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([editorCode], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'assembly_code.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                title="将当前编辑器中的代码保存为文本文件"
              >
                导出程序
              </button>
              <select
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                onChange={(e) => loadTestProgram(e.target.value as 'sort' | 'fibonacci' | 'gcd')}
                defaultValue=""
              >
                <option value="" disabled>加载示例程序</option>
                <option value="sort">排序程序</option>
                <option value="fibonacci">斐波那契程序</option>
                <option value="gcd">GCD程序</option>
                <option value="r_type_test">R型指令测试</option>
                <option value="i_type_test">I型指令测试</option>
                <option value="s_type_test">S型指令测试</option>
                <option value="b_type_test">B型指令测试</option>
                <option value="u_type_test">U型指令测试</option>
              </select>
              <button
                onClick={assembleCode}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                汇编代码
              </button>
            </div>
          </div>
          
          <Editor
            height="calc(100vh - 200px)"
            defaultLanguage="plaintext"
            value={editorCode}
            onChange={(value) => setEditorCode(value || '')}
            theme="vs"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              renderWhitespace: 'all'
            }}
            onMount={handleEditorDidMount}
          />

          <InstructionFormatPanel />
        </div>

        {/* 右侧结果部分 */}
        <div className="w-1/2 p-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="text-red-600 font-semibold mb-2">错误信息</h3>
              <p className="text-red-500">{error}</p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">汇编结果</h3>
              {assembledInstructions.length > 0 && (
                <button
                  onClick={() => {
                    const machineCode = assembledInstructions.map(inst => inst.hex).join('\n');
                    const blob = new Blob([machineCode], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'machine_code.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  导出机器码
                </button>
              )}
            </div>

            <div ref={tableBodyRef} className="overflow-auto h-[calc(100vh-200px)] w-full">
              <table className="w-full text-sm table-fixed border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left py-2 px-2 font-medium w-24 whitespace-nowrap">地址</th>
                    <th className="text-left py-2 px-2 font-medium w-28 whitespace-nowrap">机器码</th>
                    <th className="text-left py-2 px-2 font-medium w-48 whitespace-nowrap">Basic</th>
                    <th className="text-left py-2 px-2 font-medium whitespace-nowrap">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assembledInstructions.length > 0 ? (
                    assembledInstructions.map((inst, i) => (
                      <tr 
                        key={i} 
                        className={`${i === currentInstructionIndex ? 'bg-yellow-100' : ''}`}
                        id={`instruction-row-${i}`}
                      >
                        <td className="py-1 px-2 font-mono text-gray-600 text-xs whitespace-nowrap overflow-hidden text-ellipsis">{`0x${(i * 4).toString(16).padStart(8, '0')}`}</td>
                        <td className="py-1 px-2 font-mono text-blue-600 text-xs whitespace-nowrap overflow-hidden text-ellipsis">{inst.hex}</td>
                        <td className="py-1 px-2 font-mono text-xs whitespace-nowrap">{inst.assembly}</td>
                        <td className="py-1 px-2 font-mono text-gray-600 text-xs whitespace-nowrap overflow-hidden text-ellipsis">{inst.source}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        暂无汇编结果，请编写代码并点击"汇编代码"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}