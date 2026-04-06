import { useState } from 'react';
import { Button } from '../ui/Button';
import { PersonalDetails, GoalDetails, CalculationResults } from '../../types/fitness';
import { buildSummaryText, downloadSummary, copyToClipboard } from '../../utils/export';

interface ExportPanelProps {
  personal: PersonalDetails;
  goals: GoalDetails;
  results: CalculationResults;
  onReset: () => void;
}

export function ExportPanel({ personal, goals, results, onReset }: ExportPanelProps) {
  const [copied, setCopied] = useState(false);

  const text = buildSummaryText(personal, goals, results);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="secondary" onClick={() => downloadSummary(text)} className="flex-1">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Summary
        </Button>
        <Button variant="secondary" onClick={handleCopy} className="flex-1">
          {copied ? (
            <>
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to Clipboard
            </>
          )}
        </Button>
      </div>
      <Button variant="ghost" onClick={onReset} fullWidth>
        Start Over
      </Button>
    </div>
  );
}
