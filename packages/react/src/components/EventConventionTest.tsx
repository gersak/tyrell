/**
 * Test Example: React Event Convention
 * 
 * This file demonstrates the new event handling convention
 * for tyrell-react components.
 *
 * To test:
 * 1. Create a new React project or use existing
 * 2. npm install tyrell-react
 * 3. Add this component to your app
 * 4. Observe console logs and state updates
 */

import React, { useState } from 'react';
import { TyInput } from './TyInput';
import { TyTextarea } from './TyTextarea';
import { TyCheckbox } from './TyCheckbox';
import type { TyInputEventDetail } from './TyInput';
import type { TyTextareaEventDetail } from './TyTextarea';
import type { TyCheckboxEventDetail } from './TyCheckbox';

export function EventConventionTest() {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">React Event Convention Test</h1>
      
      {/* Input Test */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">TyInput Test</h2>
        <TyInput
          label="Email"
          placeholder="Type to test onChange..."
          value={inputValue}
          onChange={(e: CustomEvent<TyInputEventDetail>) => {
            setInputValue(e.detail.value);
            addLog(`onChange: "${e.detail.value}" (fires on keystroke)`);
          }}
          onChangeCommit={(e: CustomEvent<TyInputEventDetail>) => {
            addLog(`onChangeCommit: "${e.detail.value}" (fires on blur)`);
          }}
          onFocus={() => addLog('onFocus')}
          onBlur={() => addLog('onBlur')}
        />
        <p className="text-sm text-gray-600">
          Current value: <strong>{inputValue}</strong>
        </p>
      </div>

      {/* Textarea Test */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">TyTextarea Test</h2>
        <TyTextarea
          label="Comments"
          placeholder="Type to test onChange..."
          value={textareaValue}
          rows={3}
          onChange={(e: CustomEvent<TyTextareaEventDetail>) => {
            setTextareaValue(e.detail.value);
            addLog(`Textarea onChange: "${e.detail.value}"`);
          }}
          onChangeCommit={(e: CustomEvent<TyTextareaEventDetail>) => {
            addLog(`Textarea onChangeCommit: "${e.detail.value}"`);
          }}
        />
        <p className="text-sm text-gray-600">
          Current value: <strong>{textareaValue}</strong>
        </p>
      </div>

      {/* Checkbox Test */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">TyCheckbox Test</h2>
        <TyCheckbox
          checked={checked}
          onChange={(e: CustomEvent<TyCheckboxEventDetail>) => {
            setChecked(e.detail.checked);
            addLog(`Checkbox onChange: ${e.detail.checked} (fires immediately)`);
          }}
          onChangeCommit={(e: CustomEvent<TyCheckboxEventDetail>) => {
            addLog(`Checkbox onChangeCommit: ${e.detail.checked} (fires on blur)`);
          }}
        >
          Subscribe to newsletter
        </TyCheckbox>
        <p className="text-sm text-gray-600">
          Current state: <strong>{checked ? 'Checked' : 'Unchecked'}</strong>
        </p>
      </div>

      {/* Event Log */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Event Log</h2>
        <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-gray-500">No events yet. Start typing or checking boxes!</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-gray-800">
                {log}
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => setLogs([])}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Clear Log
        </button>
      </div>

      {/* Expected Behavior */}
      <div className="bg-blue-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Expected Behavior:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <strong>onChange</strong> - Fires on every keystroke/state change (React convention)
          </li>
          <li>
            <strong>onChangeCommit</strong> - Fires on blur if value changed (optional)
          </li>
          <li>
            <strong>onFocus</strong> - Fires when element gains focus
          </li>
          <li>
            <strong>onBlur</strong> - Fires when element loses focus
          </li>
        </ul>
      </div>

      {/* Verification */}
      <div className="bg-green-50 p-4 rounded">
        <h3 className="font-semibold mb-2">Verification Checklist:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ onChange fires on EVERY keystroke (not just on blur)</li>
          <li>✅ State updates in real-time as you type</li>
          <li>✅ onChangeCommit fires ONLY on blur (if value changed)</li>
          <li>✅ Event order: onChange → onBlur → onChangeCommit</li>
          <li>✅ Checkbox onChange fires immediately on click</li>
        </ul>
      </div>
    </div>
  );
}

export default EventConventionTest;