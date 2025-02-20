import { render, screen } from '@testing-library/react';
import { ALUNode } from '../ALUNode';
import '@testing-library/jest-dom';

describe('ALUNode Component', () => {
  it('应该正确渲染基本的ALU组件', () => {
    render(<ALUNode data={{ label: 'ALU Test' }} />);
    expect(screen.getByText('ALU')).toBeInTheDocument();
    expect(screen.getByText('Operation: Add')).toBeInTheDocument();
    expect(screen.getByText('A: 0')).toBeInTheDocument();
    expect(screen.getByText('B: 0')).toBeInTheDocument();
    expect(screen.getByText('Result: 0')).toBeInTheDocument();
  });

  describe('ALU操作测试', () => {
    const testCases = [
      { op: 'Add', a: 10, b: 5, expected: 15 },
      { op: 'Sub', a: 10, b: 5, expected: 5 },
      { op: 'And', a: 0b1100, b: 0b1010, expected: 0b1000 },
      { op: 'Or', a: 0b1100, b: 0b1010, expected: 0b1110 },
      { op: 'Xor', a: 0b1100, b: 0b1010, expected: 0b0110 },
      { op: 'Sll', a: 1, b: 2, expected: 4 },
      { op: 'Srl', a: -8, b: 1, expected: 2147483644 },
      { op: 'Sra', a: -8, b: 1, expected: -4 },
      { op: 'Slt', a: 5, b: 10, expected: 1 },
      { op: 'Slt', a: 10, b: 5, expected: 0 }
    ];

    testCases.forEach(({ op, a, b, expected }) => {
      it(`应该正确执行${op}操作`, () => {
        const testData = {
          label: 'ALU Test',
          operation: op,
          a,
          b
        };
        render(<ALUNode data={testData} />);
        expect(screen.getByText(`Operation: ${op}`)).toBeInTheDocument();
        expect(screen.getByText(`A: ${a}`)).toBeInTheDocument();
        expect(screen.getByText(`B: ${b}`)).toBeInTheDocument();
        expect(screen.getByText(`Result: ${expected}`)).toBeInTheDocument();
      });
    });
  });

  it('应该正确处理选中状态的样式', () => {
    const { container } = render(<ALUNode data={{ label: 'ALU Test' }} selected={true} />);
    const nodeElement = container.firstChild as HTMLElement;
    expect(nodeElement).toHaveClass('border-blue-500');
  });

  it('应该正确处理未选中状态的样式', () => {
    const { container } = render(<ALUNode data={{ label: 'ALU Test' }} selected={false} />);
    const nodeElement = container.firstChild as HTMLElement;
    expect(nodeElement).toHaveClass('border-gray-200');
  });

  it('应该包含正确的输入输出连接点', () => {
    const { container } = render(<ALUNode data={{ label: 'ALU Test' }} />);
    const handles = container.getElementsByClassName('react-flow__handle');
    expect(handles.length).toBe(3); // 2个输入，1个输出

    // 验证输入连接点
    const inputHandles = container.getElementsByClassName('react-flow__handle-target');
    expect(inputHandles.length).toBe(2);
    expect(inputHandles[0]).toHaveAttribute('id', 'a');
    expect(inputHandles[1]).toHaveAttribute('id', 'b');

    // 验证输出连接点
    const outputHandles = container.getElementsByClassName('react-flow__handle-source');
    expect(outputHandles.length).toBe(1);
    expect(outputHandles[0]).toHaveAttribute('id', 'result');
  });
});