import { useState, useCallback } from 'react';
import { parseT3D } from '../utils/t3dParser';
import BoardEditor, { JsonPayload } from './BoardEditor';

const AI_PROMPT = `这是一段虚幻引擎 (Unreal Engine) 项目中的蓝图核心逻辑流。
我使用自定义的语法将其提取成了极简文本（"<- IN" 代表输入，"-> OUT" 代表输出与去向）。
请仔细阅读并理解这段逻辑的执行流程与数据传递关系，将其作为我们后续讨论和开发的上下文，便于我们重构，优化，调整，形成以c++为主，蓝图为辅的新代码。

=== 蓝图执行流数据 ===
{DSL}
=== 结束 ===`;

export default function T3DExtractor() {
  const [t3dInput, setT3dInput] = useState('');
  const [dslOutput, setDslOutput] = useState('');
  const [payloadOutput, setPayloadOutput] = useState<JsonPayload | null>(null);

  const [copiedNormal, setCopiedNormal] = useState(false);
  const [copiedPlus, setCopiedPlus] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setT3dInput(val);
    try {
      const res = parseT3D(val);
      setDslOutput(res.dsl || '（提取的执行流将显示在此...）');
      setPayloadOutput(res.payload);
    } catch (err) {
      setDslOutput('解析失败，请检查是否包含完整的 Begin Object ... End Object 数据！');
      setPayloadOutput(null);
    }
  }, []);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setT3dInput(text);
        try {
          const res = parseT3D(text);
          setDslOutput(res.dsl || '（提取的执行流将显示在此...）');
          setPayloadOutput(res.payload);
        } catch (err) {
          setDslOutput('解析失败，请检查是否包含完整的 Begin Object ... End Object 数据！');
          setPayloadOutput(null);
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  }, []);

  const handleCopyNormal = useCallback(() => {
    if (!dslOutput || dslOutput.startsWith('（等待') || dslOutput.startsWith('解析失败')) return;
    navigator.clipboard.writeText(dslOutput);
    setCopiedNormal(true);
    setTimeout(() => setCopiedNormal(false), 2000);
  }, [dslOutput]);

  const handleCopyPlus = useCallback(() => {
    if (!dslOutput || dslOutput.startsWith('（等待') || dslOutput.startsWith('解析失败')) return;
    const finalCopyText = AI_PROMPT.replace('{DSL}', dslOutput);
    navigator.clipboard.writeText(finalCopyText);
    setCopiedPlus(true);
    setTimeout(() => setCopiedPlus(false), 2000);
  }, [dslOutput]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#141414', overflow: 'hidden' }}>
      
      {/* ── Top Half: Text Handling ── */}
      <div style={{ display: 'flex', height: '45%', minHeight: 300, gap: 2, borderBottom: '2px solid #000' }}>
        
        {/* ── Left Pane: Input ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#1a1a1a', borderRight: '1px solid #2a2a2a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#1c1c1c', borderBottom: '1px solid #2a2a2a' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>📥 蓝图代码输入 (T3D)</span>
            <button onClick={handlePasteFromClipboard}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 4, border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', cursor: 'pointer', fontSize: 12, transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}>
              📋 一键粘贴
            </button>
          </div>
          <textarea
            value={t3dInput}
            onChange={handleInputChange}
            placeholder="在此处粘贴虚幻引擎蓝图代码 (Begin Object...)"
            spellCheck={false}
            style={{ flex: 1, width: '100%', padding: '16px', boxSizing: 'border-box', background: 'transparent', border: 'none', color: '#94a3b8', fontFamily: '"Fira Code", monospace', fontSize: 12, lineHeight: 1.6, resize: 'none', outline: 'none' }}
          />
        </div>

        {/* ── Right Pane: Output DSL ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#161616' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', background: '#1c1c1c', borderBottom: '1px solid #2a2a2a' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>📋 提取结果 (Context DSL)</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCopyNormal}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: copiedNormal ? '#22c55e' : 'rgba(255,255,255,0.05)', color: copiedNormal ? '#fff' : '#e2e8f0', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}>
                <span>{copiedNormal ? '✅' : '📄'}</span>
                <span>{copiedNormal ? '已复制' : '复制代码'}</span>
              </button>
              <button onClick={handleCopyPlus}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 6, border: 'none', background: copiedPlus ? '#22c55e' : 'linear-gradient(135deg, #2563eb, #1e40af)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s' }}
                onMouseEnter={e => { if (!copiedPlus) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { if (!copiedPlus) e.currentTarget.style.transform = 'translateY(0)'; }}>
                <span>{copiedPlus ? '✅' : '🚀'}</span>
                <span>{copiedPlus ? '已注入剪贴板！' : '复制 Plus (注入上下文)'}</span>
              </button>
            </div>
          </div>
          <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
            {dslOutput && (
              <pre style={{ margin: 0, color: '#6ee7b7', fontFamily: '"Fira Code", monospace', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all', userSelect: 'text' }}>
                <code>{dslOutput}</code>
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Half: Board Rendering ── */}
      <div style={{ flex: 1, position: 'relative', background: '#101010' }}>
        {payloadOutput ? (
          <BoardEditor payload={payloadOutput} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 14 }}>
            粘贴有效的 T3D 蓝图代码以在此处预览连线图...
          </div>
        )}
      </div>
      
    </div>
  );
}
