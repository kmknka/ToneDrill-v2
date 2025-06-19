import { useState } from 'react';
import './App.css';
import { tv } from 'tailwind-variants';
import {
  TUNING_DEFAULTS,
  NOTES,
  NOTE_INDEX,
  getNoteFromFret,
  SCALE_MAP,
  DIATONIC_CHORDS_MAJOR,
  DIATONIC_CHORDS_MINOR,
  CHROMATIC_INTERVALS_INDEX
} from './constants.jsx';

// Global variables
const tuningDefaults = TUNING_DEFAULTS;

// 共通部品（CheckInterval InputWithButton）
function InputWithButton({ 
  placeholder, value, onChange, onKeyDown, onClick, buttonLabel 
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-2 items-center">
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        inputMode="latin"
        style={{ imeMode: 'disabled' }}
        onKeyDown={onKeyDown}
        className="border rounded px-2 py-1 w-full"
      />
      <button
        onClick={onClick}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition w-full"
      >
        {buttonLabel}
      </button>
    </div>
  );
}



function App() {
  // 状態管理
  const [tuning, setTuning] = useState(tuningDefaults);
  const [keyNote, setKeyNote] = useState('C');
  const [scaleType, setScaleType] = useState('Major');

  const [selectedMode, setSelectedMode] = useState('SingleTone'); // モード選択用（未確定）
  const [mode, setMode] = useState(null);               // 確定モード。nullなら非表示

  const [rootNote, setRootNote] = useState(null); // ChordTone用
  const [rootPos, setRootPos] = useState(null);   // ChordTone用 (string,fret)
  const [enteredRoot, setEnteredRoot] = useState(false); // ChordTone用

  const [inputValue, setInputValue] = useState('');
  const [rootInputValue, setRootInputValue] = useState('');

  const [messages, setMessages] = useState([]);



  // モード確定ボタンハンドラ
  const handleConfirmMode = () => {
    if (selectedMode) {
      setMode(selectedMode);
      setRootNote(null);
      setMessages([]);
    }
  };

  // チューニングの入力を受けてstate更新する関数
  const handleTuningChange = (stringNum, value) => {
    setTuning(prev => ({
      ...prev,
      [stringNum]: value.toUpperCase().trim()
    }));
  };

  // ノート取得関数はconstants.jsのgetNoteFromFretを使う

  // インターバル計算(SingleTone用)
  function getIntervalFromKey(note){
    const scaleIntervals = SCALE_MAP[scaleType];
    const rootIndex = NOTE_INDEX[keyNote];
    const noteIndex = NOTE_INDEX[note];
    const semitoneDiff = (noteIndex - rootIndex + 12) % 12;

    for (const [intervalName, semitone] of Object.entries(scaleIntervals)) {
      if (semitone === semitoneDiff) {
        return intervalName;
      }
    }
    return null;
  }

  // クロマティックインターバル計算（ChordTone用）
  function getChromaticInterval(root, note) {
    if (!root) return '';
    const rootIdx = NOTE_INDEX[root];
    const noteIdx = NOTE_INDEX[note];
    const diff = (noteIdx - rootIdx + 12) % 12;
    return CHROMATIC_INTERVALS_INDEX[diff] || 'N/A';
  }

  // 入力処理（SingleTone / ChordTone 共通）
  function handleInput() {
    if (!inputValue.includes(',')) {
      setMessages(prev => [...prev, 'Invalid input format. Use string,fret']);
      setInputValue('');
      return;
    }
    const [stringStr, fretStr] = inputValue.split(',');
    const stringNum = Number(stringStr);
    const fretNum = Number(fretStr);
    if (!(stringNum in tuning)) {
      setMessages(prev => [...prev, 'Invalid string number']);
      setInputValue('');
      return;
    }
    if (fretNum < 0 || fretNum > 22) {
      setMessages(prev => [...prev, 'Fret out of range']);
      setInputValue('');
      return;
    }
    const note = getNoteFromFret(tuning[stringNum], fretNum);

    if (mode === 'SingleTone') {
      const interval = getIntervalFromKey(note);
      setMessages(prev => [...prev, `Input: (${stringNum},${fretNum}) Note: ${note} Interval from ${keyNote}: ${interval}`]);
    } else if (mode === 'ChordTone') {
      if (!rootNote) {
        setMessages(prev => [...prev, 'Please input root note first in ChordTone mode']);
      } else {
        const interval = getChromaticInterval(rootNote, note);
        setMessages(prev => [...prev, `Input: (${stringNum},${fretNum}) Note: ${note} Interval from root (${rootNote}): ${interval}`]);
      }
    }
    setInputValue('');
  }

  // rootNote入力（ChordTone用）
  function handleRootInput() {
    if (!rootInputValue.includes(',')) {
      setMessages(prev => [...prev, 'Invalid root input format']);
      setRootInputValue('');
      return;
    }
    const [stringStr, fretStr] = rootInputValue.split(',');
    const stringNum = Number(stringStr);
    const fretNum = Number(fretStr);
    if (!(stringNum in tuning)) {
      setMessages(prev => [...prev, 'Invalid string number']);
      setRootInputValue('');
      return;
    }
    if (fretNum < 0 || fretNum > 22) {
      setMessages(prev => [...prev, 'Fret out of range']);
      setRootInputValue('');
      return;
    }
    const note = getNoteFromFret(tuning[stringNum], fretNum);
    setRootNote(note);
    setRootPos([stringNum, fretNum]);
    setRootInputValue('');
    setEnteredRoot(true);
  }


  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-100">
      <div className="w-full max-w-2xl mx-4 p-6 border rounded-lg shadow-md bg-white
        flex flex-col items-center space-y-4">
        <h1 className='text-3xl font-bold mb-4'>ToneDrill</h1>
        
        {/* チューニングセクション(mode選択後非表示) */}
        {!mode && (
          <div className="tuning-section w-full px-4 py-6 bg-white rounded-md">
            <label className='block text-center text-lg font-semibold mb-6'>
              Tuning (Edit each string) 
            </label>

            <div className="space-y-4">
              {Object.entries(tuning)
              .sort((a,b) => b[0] - a[0])
              .map(([stringNum, note]) => (
                <div
                  key={stringNum}
                  className="flex items-center gap-6"
                >
                  <label className="w-12 text-right font-medium">{stringNum}弦:</label>

                  <select
                    className="flex-1 border border-gray-30
                    0 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={note}
                    onChange={(e) => handleTuningChange(stringNum, e.target.value)}
                    aria-label={`${stringNum} string tuning note`}
                    >
                      {NOTES.map(n => (
                        <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
          )}
        
        <div className="controls-container w-full max-w-2xl mx-auto mt-6 p-6 bg-white border rounded-lg shadow-md space-y-6">
        {!mode && (
          <>
            {/* Key, Scale, Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Key */}
              <div className="flex items-center gap-2">
                <label className="font-medium">Key:</label>
                <select
                  className="border rounded px-2 py-1 flex-1"
                  value={keyNote}
                  onChange={(e) => setKeyNote(e.target.value)}
                >
                  {NOTES.map(note => (
                    <option key={note} value={note}>{note}</option>
                  ))}
                </select>
              </div>
              {/* Scale */}
              <div className="flex items-center gap-2">
                <label className="font-medium">Scale:</label>
                <select
                  className="border rounded px-2 py-1 flex-1"
                  value={scaleType}
                  onChange={(e) => setScaleType(e.target.value)}
                >
                  {Object.keys(SCALE_MAP).map(scale => (
                    <option key={scale} value={scale}>{scale}</option>
                  ))}
                </select>
              </div>

              {/* Mode */}
              <div className="flex items-center gap-2">
                <label className="font-medium">Mode:</label>
                <select
                  className="border rounded px-2 py-1 flex-1"
                  value={selectedMode}
                  onChange={e => setSelectedMode(e.target.value)}
                >
                  <option value="SingleTone">Single Tone</option>
                  <option value="ChordTone">Chord Tone</option>
                </select>
              </div>
            </div>
          </>
        )}

          {/* Confirm Mode Button */}
          {!mode && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleConfirmMode}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Confirm Mode
              </button>
            </div>
          )}
          
          {/* Conditional Mode Inputs */}
          {mode && (
            <>
              {/* ChordTone の場合*/}
              {mode === 'ChordTone' && (
                <>
                  {/* Root Noteが設定されている場合の表示 */}
                  { enteredRoot && (
                    <>
                      <div className="flex flex-col text-lg font-semibold mb-4">
                        <label className=" text-green-600">{mode} START Input string,fret for Root Note:</label>
                        <label> Root Note: {rootNote} ({rootPos[0]},{rootPos[1]})</label>
                      </div>

                      <InputWithButton
                        placeholder="Input string,fret e.g. 6,0"
                        value={inputValue}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^\d,]/g, '');
                          setInputValue(cleaned);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleInput();
                        }}
                        onClick={handleInput}
                        buttonLabel="Check Interval"
                      />
              
                      <div className="message-log">
                        {messages.map((msg, i) => (
                          <div key={i}>{msg}</div>
                        ))}
                      </div>
                    </>
                  )}
                  {/* Root Noteが未設定の場合の表示 */}
                  { !enteredRoot && (
                    <>
                    <label className="block text-lg font-semibold text-green-600 mb-4">
                      {mode} START Select Root Note
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-2 items-center">
                      <input
                        placeholder="Root input e.g. 6,3"
                        value={rootInputValue}
                        onChange={e => {
                          const halfWidthOnly = e.target.value.replace(/[^\d,]/g, '');
                          setRootInputValue(halfWidthOnly)
                        }}
                        inputMode="latin"
                        style={{ imeMode: 'disabled' }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRootInput();
                      }}
                      className="border rounded px-2 py-1 w-full"
                      />
                      <button 
                        onClick={handleRootInput}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition w-full"
                      >
                        Set Root Note
                      </button>
                    </div>
                    </>
                  )}
                </>
              )}
              {/* SingleToneの場合*/}
              {mode === 'SingleTone' && (
                <>
                  <InputWithButton
                    placeholder="Input string,fret e.g. 6,0"
                    value={inputValue}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d,]/g, '');
                      setInputValue(cleaned);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleInput();
                    }}
                    onClick={handleInput}
                    buttonLabel="Check Interval"
                  />
              
                  <div className="message-log">
                    {messages.map((msg, i) => (
                      <div key={i}>{msg}</div>
                      ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};


export default App;