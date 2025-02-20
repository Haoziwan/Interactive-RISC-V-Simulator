import { render, screen } from '@testing-library/react';
import { InstructionMemoryNode } from '../InstructionMemoryNode';
import '@testing-library/jest-dom';

describe('InstructionMemoryNode Component', () => {
  it('应该正确渲染基本的指令存储器组件', () => {
    render(<InstructionMemoryNode data={{ label: 'Instruction Memory Test' }} />);
    expect(screen.getByText('Instruction Memory')).toBeInTheDocument();
    expect(screen.getByText('Address: 0x00000000')).toBeInTheDocument();
  });

  describe('指令存储器读取测试', () => {
    const testCases = [
      { 
        address: 0x0, 
        instructions: [
          { hex: '0x00500113', address: 0x0 },  // addi x2, x0, 5
          { hex: '0x00310233', address: 0x4 }   // add x4, x2, x3
        ],
        expected: '0x00500113'
      },
      { 
        address: 0x4, 
        instructions: [
          { hex: '0x00500113', address: 0x0 },
          { hex: '0x00310233', address: 0x4 }
        ],
        expected: '0x00310233'
      }
    ];

    testCases.forEach(({ address, instructions, expected }) => {
      it(`应该正确读取地址${address.toString(16)}的指令`, () => {
        const testData = {
          label: 'Instruction Memory Test',
          address,
          instructions
        };
        render(<InstructionMemoryNode data={testData} />);
        expect(screen.getByText(`Address: 0x${address.toString(16).padStart(8, '0')}`)).toBeInTheDocument();
        expect(screen.getByText(`Instruction: ${expected}`)).toBeInTheDocument();
      });
    });
  });

  it('应该正确处理选中状态的样式', () => {
    const { container } = render(<InstructionMemoryNode data={{ label: 'Instruction Memory Test' }} selected={true} />);
    const nodeElement = container.firstChild as HTMLElement;
    expect(nodeElement).toHaveClass('border-blue-500');
  });

  it('应该正确处理未选中状态的样式', () => {
    const { container } = render(<InstructionMemoryNode data={{ label: 'Instruction Memory Test' }} selected={false} />);
    const nodeElement = container.firstChild as HTMLElement;
    expect(nodeElement).toHaveClass('border-gray-200');
  });

  it('应该包含正确的输入输出连接点', () => {
    const { container } = render(<InstructionMemoryNode data={{ label: 'Instruction Memory Test' }} />);
    const handles = container.getElementsByClassName('react-flow__handle');
    expect(handles.length).toBe(2); // 1个输入，1个输出

    // 验证输入连接点
    const inputHandles = container.getElementsByClassName('react-flow__handle-target');
    expect(inputHandles.length).toBe(1);
    expect(inputHandles[0]).toHaveAttribute('id', 'address');

    // 验证输出连接点
    const outputHandles = container.getElementsByClassName('react-flow__handle-source');
    expect(outputHandles.length).toBe(1);
    expect(outputHandles[0]).toHaveAttribute('id', 'instruction');
  });
});