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
  const [decorations, setDecorations] = useState<string[]>([]);
  
  // 使用store中的状态
  const editorCode = useCircuitStore((state) => state.editorCode);
  const setEditorCode = useCircuitStore((state) => state.setEditorCode);
  const assembledInstructions = useCircuitStore((state) => state.assembledInstructions);
  const setAssembledInstructions = useCircuitStore((state) => state.setAssembledInstructions);
  const updateNodeData = useCircuitStore((state) => state.updateNodeData);
  const nodes = useCircuitStore((state) => state.nodes);
  const currentInstructionIndex = useCircuitStore((state) => state.currentInstructionIndex);
  const isSimulating = useCircuitStore((state) => state.isSimulating);
  const stepCount = useCircuitStore((state) => state.stepCount);

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
    let currentInstructionCount = 0;
    
    for (let i = 0; i < sourceLines.length; i++) {
      const line = sourceLines[i].split('#')[0].trim();
      // 跳过空行、注释行、标签行和段指令
      if (line && !line.endsWith(':') && line !== '.data' && line !== '.text') {
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
      // 找到当前PC对应的行
      const currentPC = currentInstructionIndex * 4;
      const rows = tableBodyRef.current.querySelectorAll('tr');
      let highlightedRow = null;
      
      // 查找包含当前PC地址的行
      for (const row of rows) {
        const firstCell = row.querySelector('td:first-child');
        if (firstCell && firstCell.textContent?.includes(`0x${currentPC.toString(16).padStart(8, '0')}`)) {
          highlightedRow = row;
          break;
        }
      }
      
      // 如果找不到，则找已高亮的行
      if (!highlightedRow) {
        highlightedRow = tableBodyRef.current.querySelector('.bg-yellow-50')?.parentElement;
      }
                             
      if (highlightedRow) {
        highlightedRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Monaco编辑器的高亮处理
    if (editorRef.current && monaco) {
      // 始终清除所有现有的高亮，无论它们是如何创建的
      // 这确保了编辑器中只有一个高亮行
      const currentModel = editorRef.current.getModel();
      if (currentModel) {
        // 清除所有现有的装饰，包括可能由其他来源添加的装饰
        const oldDecorations = editorRef.current.getModel().getAllDecorations()
          .filter((d: { options: { className?: string; glyphMarginClassName?: string } }) => 
            d.options.className === 'monaco-highlight-line' || d.options.glyphMarginClassName === 'monaco-highlight-glyph')
          .map((d: { id: string }) => d.id);
        
        if (oldDecorations.length > 0) {
          editorRef.current.deltaDecorations(oldDecorations, []);
        }
        
        // 清除 ourselves tracking decorations
        if (decorations.length > 0) {
          editorRef.current.deltaDecorations(decorations, []);
          setDecorations([]);
        }
      }

      // 如果有有效的指令索引，无论是否在模拟状态下，都添加高亮
      // 这样在单步执行时也能正确高亮
      if (currentInstructionIndex !== null && currentInstructionIndex >= 0) {
        const sourceLine = getSourceLineFromInstructionIndex(currentInstructionIndex);
        if (sourceLine >= 0) {
          const newDecorations = editorRef.current.deltaDecorations([], [
            {
              range: new monaco.Range(sourceLine + 1, 1, sourceLine + 1, 1),
              options: {
                isWholeLine: true,
                className: 'monaco-highlight-line',
                glyphMarginClassName: 'monaco-highlight-glyph'
              }
            }
          ]);
          setDecorations(newDecorations);
        }
      }
    }
  }, [currentInstructionIndex, monaco, stepCount]);

  // 监听monaco实例加载完成
  useEffect(() => {
    if (monaco) {
      // 添加自定义CSS样式
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .monaco-highlight-line {
          background-color: rgba(255, 255, 0, 0.2) !important;
          border-left: 3px solid gold !important;
        }
        .monaco-highlight-glyph {
          background-color: gold;
          width: 5px !important;
          margin-left: 3px;
        }
      `;
      document.head.appendChild(styleElement);
      
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, [monaco]);

  // 监听模拟状态变化，当模拟结束或重置时清除高亮
  useEffect(() => {
    if (editorRef.current && monaco) {
      // 当模拟结束时，清除所有高亮
      if (!isSimulating) {
        const currentModel = editorRef.current.getModel();
        if (currentModel) {
          // 清除所有现有的装饰，包括可能由其他来源添加的装饰
          const oldDecorations = editorRef.current.getModel().getAllDecorations()
            .filter((d: { options: { className?: string; glyphMarginClassName?: string } }) => 
              d.options.className === 'monaco-highlight-line' || d.options.glyphMarginClassName === 'monaco-highlight-glyph')
            .map((d: { id: string }) => d.id);
          
          if (oldDecorations.length > 0) {
            editorRef.current.deltaDecorations(oldDecorations, []);
          }
          
          // 清除 ourselves tracking decorations
          if (decorations.length > 0) {
            editorRef.current.deltaDecorations(decorations, []);
            setDecorations([]);
          }
        }
      }
    }
  }, [isSimulating, monaco]);

  const assembleCode = () => {
    setError(null);
    useCircuitStore.getState().resetSimulation();
    
    try {
      const assemblerInstance = new Assembler();
      const instructions = assemblerInstance.assemble(editorCode);
      
      // 处理内存数据（如果存在）
      // @ts-ignore - memoryData是我们特殊添加的属性
      if (instructions.length > 0 && instructions[0].memoryData) {
        // @ts-ignore
        const memoryData = instructions[0].memoryData;
        
        // 在resetSimulation之后确保内存数据被正确设置
        // 增加延迟确保内存数据写入在模拟开始之前完成
        setTimeout(() => {
          // 先清空内存，然后设置新的内存数据
          useCircuitStore.getState().clearMemory();  // 使用新的clearMemory函数
          setTimeout(() => {
            // 然后设置新的数据段内存
            useCircuitStore.getState().updateMemory(memoryData);
          }, 10);
        }, 50);
        
        // 从结果中删除memoryData属性，防止影响后续处理
        // @ts-ignore
        delete instructions[0].memoryData;
      }
      
      // 过滤掉数据段指令，只保留文本段指令
      const textInstructions = instructions.filter(inst => inst.segment !== 'data');
      
      // 将汇编指令与机器码对应
      // 此处我们将使用展开后的伪指令作为assembly
      const instructionsWithAssembly = textInstructions.map((inst) => {
        // 保留原有的assembly字段，它已经是展开后的实际指令
        return {
          ...inst,
          sourceLineIndex: -1 // 稍后会设置正确的行号
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
      const response = await fetch(`/test-programs/${programType}.s`);
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
            <h2 className="text-lg font-semibold">Code Editor</h2>
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
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                title="Import .txt or .s assembly code file"
              >
                Import
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
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                title="Save current editor code as text file"
              >
                Export
              </button>
              <select
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                onChange={(e) => loadTestProgram(e.target.value as 'fibonacci' | 'gcd')}
                defaultValue=""
              >
                <option value="" disabled>Load Example Program</option>
                <option value="fibonacci">Fibonacci Program</option>
                <option value="gcd">GCD Program</option>
                <option value="r_type_test">R-Type Test</option>
                <option value="i_type_test">I-Type Test</option>
                <option value="s_type_test">S-Type Test</option>
                <option value="b_type_test">B-Type Test</option>
                <option value="u_type_test">U-Type Test</option>
                <option value="j_type_test">J-Type Test</option>
                <option value="data_segment_test">Data Segment Test</option>
              </select>
              <button
                onClick={assembleCode}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Assemble
              </button>
            </div>
          </div>
          
          <Editor
            height="calc(100vh - 160px)"
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
              <h3 className="text-red-600 font-semibold mb-2">Error Message</h3>
              <p className="text-red-500">{error}</p>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Result</h3>
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
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Export Code
                </button>
              )}
            </div>

            <div ref={tableBodyRef} className="overflow-auto h-[calc(100vh-10rem)] w-full border border-gray-200 rounded-lg shadow-sm">
              <table className="w-full text-sm table-fixed border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="text-left py-2.5 px-3 font-medium w-24 whitespace-nowrap border-b border-gray-200">Address</th>
                    <th className="text-left py-2.5 px-3 font-medium w-28 whitespace-nowrap border-b border-gray-200">Code</th>
                    <th className="text-left py-2.5 px-3 font-medium w-48 whitespace-nowrap border-b border-gray-200">Basic</th>
                    <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap border-b border-gray-200">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assembledInstructions.length > 0 ? (
                    assembledInstructions
                      .filter(inst => inst.segment !== 'data') // 过滤掉数据段指令
                      .map((inst, i) => (
                      <tr 
                        key={i} 
                        className={`${currentInstructionIndex * 4 === inst.address ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50'} transition-colors duration-150`}
                        id={`instruction-row-${i}`}
                      >
                        <td className="py-2 px-3 font-mono text-gray-600 text-xs whitespace-nowrap overflow-hidden text-ellipsis">{`0x${(inst.address !== undefined ? inst.address : i * 4).toString(16).padStart(8, '0')}`}</td>
                        <td className="py-2 px-3 font-mono text-blue-600 text-xs whitespace-nowrap overflow-hidden text-ellipsis">{inst.hex}</td>
                        <td className="py-2 px-3 font-mono text-xs whitespace-nowrap">{inst.assembly}</td>
                        <td className="py-2 px-3 font-mono text-gray-600 text-xs whitespace-nowrap overflow-hidden text-ellipsis">{inst.source}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        No assembly result. Please write code and click "Assemble Code"
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