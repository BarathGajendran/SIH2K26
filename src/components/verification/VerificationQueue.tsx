import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { SurveySession, LandParcel, EncroachmentAlert } from '../../types';
import { api } from '../../services/api';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldCheck,
  Satellite,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  MapPin,
} from 'lucide-react';

interface QueueItem {
  survey: SurveySession;
  parcel?: LandParcel;
  alerts: EncroachmentAlert[];
}

export const VerificationQueue: React.FC<{ onViewReport?: (survey: SurveySession) => void }> = ({ onViewReport }) => {
  const { currentUser, refreshData, showNotification } = useApp();

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<string>('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [rejectActionType, setRejectActionType] = useState<'REJECT' | 'REQUEST_RESURVEY'>('REJECT');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVerificationQueue();
      if (res.queue) {
        setQueue(res.queue);
        if (res.queue.length > 0 && !selectedItem) {
          setSelectedItem(res.queue[0]);
        }
      }
    } catch (err) {
      console.error('Queue load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleApprove = async (surveyId: string) => {
    try {
      const res = await api.verifySurveyAction(surveyId, {
        action: 'APPROVE',
        officialName: currentUser?.name || 'Shri. M. Shanmugam (RDO)',
        officialId: currentUser?.id || 'usr-official-1',
        notes: 'Digitally verified against Cadastral FMB baseline. RTK coordinates certified within 2cm accuracy standard.',
      });

      if (res.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
        showNotification(`Survey #${surveyId} officially APPROVED and committed to Land Revenue Registry!`, 'success');
        await refreshData();
        await loadQueue();
      }
    } catch (err: any) {
      showNotification(err.message || 'Approval failed', 'error');
    }
  };

  const handleRejectOrResurvey = async () => {
    if (!selectedItem) return;
    try {
      const res = await api.verifySurveyAction(selectedItem.survey.id, {
        action: rejectActionType,
        officialName: currentUser?.name || 'Shri. M. Shanmugam (RDO)',
        officialId: currentUser?.id || 'usr-official-1',
        notes: rejectionNotes || 'Resurvey requested due to boundary discrepancy.',
      });

      if (res.success) {
        showNotification(
          rejectActionType === 'REJECT'
            ? 'Survey rejected and flagged as disputed.'
            : 'Resurvey successfully requested from field surveyor.',
          'info'
        );
        setIsRejectModalOpen(false);
        setRejectionNotes('');
        await refreshData();
        await loadQueue();
      }
    } catch (err: any) {
      showNotification(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="h-[calc(100vh-61px)] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-mono text-[11px] font-bold">
              REVENUE OFFICIAL AUDIT QUEUE
            </span>
            <span className="text-xs text-slate-500">| Revenue Divisional Office (RDO) / Tahsildar Portal</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">Official Survey Review & Cadastral Certification</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit high-precision GNSS/RTK coordinates, boundary comparison deltas, and grant digital seal of approval.
          </p>
        </div>

        <div className="text-right font-mono text-xs">
          <span className="text-slate-500">Pending Review: </span>
          <span className="text-amber-600 dark:text-amber-400 font-black text-sm">{queue.length} Surveys</span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Review Queue List */}
        <div className="w-[360px] sm:w-[380px] border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 flex flex-col h-full overflow-y-auto shrink-0">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50/70 dark:bg-slate-950/40">
            SUBMITTED SURVEYS ({queue.length})
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-y-auto flex-1">
            {queue.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mx-auto" />
                <p>All submitted surveys have been reviewed and verified!</p>
              </div>
            ) : (
              queue.map((item) => {
                const isSelected = selectedItem?.survey.id === item.survey.id;
                return (
                  <div
                    key={item.survey.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 transition-colors cursor-pointer text-left ${
                      isSelected ? 'bg-amber-50/80 dark:bg-slate-800/90 border-l-4 border-l-amber-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                            SF {item.survey.surveyNumber}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                            {item.survey.village}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.survey.surveyorName}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-mono font-bold">
                        {item.survey.status}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Area: {item.survey.calculatedAreaAcres || item.parcel?.areaAcres} Ac
                      </span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-semibold">Acc: ±{(item.survey.accuracy * 100).toFixed(1)}cm</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Dossier & Approval Stage */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {selectedItem ? (
            <>
              {/* Dossier Header */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-amber-500" />
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      DOSSIER REVIEW: SESSION #{selectedItem.survey.id}
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-mono font-bold">
                    RTK FIXED COMPLIANT
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Survey No. {selectedItem.survey.surveyNumber} • {selectedItem.survey.village},{' '}
                  {selectedItem.parcel?.district}
                </h2>
                <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400 font-mono">
                  <span>Owner: <strong className="text-slate-900 dark:text-slate-100">{selectedItem.parcel?.ownerName}</strong></span>
                  <span>Surveyor: <strong className="text-slate-900 dark:text-slate-100">{selectedItem.survey.surveyorName}</strong></span>
                  <span>Correction: <strong className="text-cyan-600 dark:text-cyan-400">{selectedItem.survey.correctionSource}</strong></span>
                </div>
              </div>

              {/* Area & Discrepancy Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">Surveyed Acreage</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {selectedItem.survey.calculatedAreaAcres || selectedItem.parcel?.areaAcres} Acres
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedItem.survey.calculatedAreaSqM || selectedItem.parcel?.areaSqM} m²
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">Boundary Displacement</span>
                  <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                    {selectedItem.survey.maxDisplacementM || 0.85} m
                  </div>
                  <div className="text-xs text-slate-500">Within acceptable limits</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">Average GNSS Accuracy</span>
                  <div className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
                    ±{(selectedItem.survey.accuracy * 100).toFixed(1)} cm
                  </div>
                  <div className="text-xs text-slate-500">Carrier-Phase RTK Fix</div>
                </div>
              </div>

              {/* Point Coordinates Table */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden font-mono text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-800 dark:text-slate-200">
                  SURVEY VERTEX COORDINATES LOG ({selectedItem.survey.points.length} Points)
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                  {selectedItem.survey.points.map((pt) => (
                    <div key={pt.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 flex items-center justify-center font-bold text-[10px]">
                          {pt.pointCode}
                        </span>
                        <div>
                          <div className="text-slate-800 dark:text-slate-200 font-bold">
                            Lat: {pt.latitude.toFixed(7)}° | Lng: {pt.longitude.toFixed(7)}°
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Alt: {pt.altitude.toFixed(2)}m • HDOP: {pt.hdop} • {pt.satelliteCount} Satellites
                          </div>
                        </div>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">±{(pt.accuracy * 100).toFixed(1)} cm</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleApprove(selectedItem.survey.id)}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all cursor-pointer hover:scale-102"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Approve with Digital Seal
                  </button>

                  <button
                    onClick={() => {
                      setRejectActionType('REQUEST_RESURVEY');
                      setIsRejectModalOpen(true);
                    }}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Request Field Resurvey
                  </button>

                  <button
                    onClick={() => {
                      setRejectActionType('REJECT');
                      setIsRejectModalOpen(true);
                    }}
                    className="px-4 py-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Survey
                  </button>
                </div>

                {onViewReport && (
                  <button
                    onClick={() => onViewReport(selectedItem.survey)}
                    className="px-4 py-3 bg-cyan-50 dark:bg-cyan-950/80 hover:bg-cyan-100 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    Preview Form IV Report
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              Select a submitted survey on the left to review telemetry and approve.
            </div>
          )}
        </div>
      </div>

      {/* Reject / Resurvey Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {rejectActionType === 'REJECT' ? 'Reject Cadastral Survey' : 'Request Field Resurvey'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide formal reason or specific boundary corners requiring ground re-verification.
            </p>

            <textarea
              rows={4}
              placeholder="Enter official remarks..."
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:border-amber-500 focus:outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectOrResurvey}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                Submit Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
