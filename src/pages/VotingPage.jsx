import { CheckCircle2, Shield, ThumbsDown, ThumbsUp, Vote } from 'lucide-react';
import { useState } from 'react';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { PlayerList } from '../components/PlayerList';
import { TimerBar } from '../components/TimerBar';
import { GameTopBar } from '../components/UtilityBar';
import { sound } from '../lib/sound';
import { useGameStore } from '../store/useGameStore';
export function VotingPage() {
    const { gameState, voteGuesser, voteSuspect, error } = useGameStore();
    const [selectedSuspectId, setSelectedSuspectId] = useState(null);
    if (!gameState || !gameState.voting)
        return null;
    const { me, players, voting, timer } = gameState;
    const isEligible = voting.eligibleVoterIds.includes(me.id);
    const guesser = players.find((p) => p.id === voting.guesserId);
    const suspectCandidates = players.filter((p) => !p.isMaster && p.id !== me.id);
    return (<div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-4" data-testid="phase-voting">
      <GameTopBar roomCode={gameState.roomCode} phaseLabel="เฟส 3: โหวต"/>
      <TimerBar timer={timer} label={voting.stage === 'GUESSER_VOTE'
            ? 'โหวตขั้นที่ 1: สงสัยว่าคนทายคำถูกคืออินไซเดอร์ไหม?'
            : 'โหวตขั้นที่ 2: เลือกชี้ตัวผู้ต้องสงสัยว่าเป็นอินไซเดอร์!'}/>

      {error && (<div role="alert" aria-live="polite" data-testid="error-banner" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-700 dark:text-red-300">
          {error}
        </div>)}

      {voting.stage === 'SUSPECT_VOTE' && voting.stage1Summary && (<div className="rounded-xl border border-[var(--accent-master)]/40 bg-[var(--accent-master)]/10 px-4 py-3 text-sm">
          โหวตขั้นที่ 1 เสียงไม่ถึงครึ่ง (ใช่ {voting.stage1Summary.yesCount} / ไม่ใช่{' '}
          {voting.stage1Summary.noCount}) — เข้าสู่ขั้นที่ 2 ให้ทุกคนเลือกชี้ตัวผู้ต้องสงสัย!
        </div>)}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="tabletop-card animate-card-pop rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent-insider)]">
              <Vote aria-hidden="true" className="h-4 w-4"/>
              {voting.stage === 'GUESSER_VOTE' ? 'โหวตขั้นที่ 1' : 'โหวตชี้ตัว'}
            </span>
            <span aria-live="polite" data-testid="voting-progress" className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-xs font-bold tabular-nums">
              โหวตแล้ว {voting.votedPlayerIds.length} / {voting.eligibleVoterIds.length} คน
            </span>
          </div>

          {!isEligible ? (<div className="rounded-xl bg-[var(--bg-subtle)]/70 p-6 text-center text-sm text-[var(--ink-secondary)]">
              <Shield aria-hidden="true" className="mx-auto mb-2 h-6 w-6 text-[var(--accent-master)]"/>
              รอบนี้มาสเตอร์ไม่ได้ร่วมโหวต กำลังรอผู้เล่นคนอื่นลงคะแนน…
            </div>) : voting.hasVoted ? (<div data-testid="vote-submitted-notice" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
              <CheckCircle2 aria-hidden="true" className="mx-auto mb-2 h-8 w-8 text-emerald-600 dark:text-emerald-400"/>
              <div className="font-display text-lg font-bold">บันทึกผลโหวตเรียบร้อย</div>
              <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                ผลโหวตของคุณจะถูกเก็บเป็นความลับจนกว่าทุกคนจะโหวตครบ
              </p>
            </div>) : voting.stage === 'GUESSER_VOTE' && guesser ? (<div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold">
                  คุณคิดว่า <span className="text-[var(--accent-insider)]">{guesser.name}</span>{' '}
                  คืออินไซเดอร์หรือไม่?
                </h2>
                <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                  {guesser.name} เป็นคนทายคำลับถูก หากเสียงส่วนใหญ่โหวต <strong>ใช่</strong>{' '}
                  จะตัดสินทันที แต่หากไม่ใช่ จะไปโหวตชี้ตัวทุกคนในขั้นถัดไป
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" data-testid="btn-vote-guesser-yes" onClick={() => {
                sound.voteCast();
                void voteGuesser(true);
            }} className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-[var(--accent-insider)] bg-[var(--accent-insider)]/10 p-5 font-display text-base font-bold text-[var(--accent-insider)] transition-colors hover:bg-[var(--accent-insider)] hover:text-white">
                  <ThumbsUp aria-hidden="true" className="h-6 w-6"/>
                  ใช่ — อินไซเดอร์!
                </button>
                <button type="button" data-testid="btn-vote-guesser-no" onClick={() => {
                sound.voteCast();
                void voteGuesser(false);
            }} className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-[var(--accent-commoner)] bg-[var(--accent-commoner)]/10 p-5 font-display text-base font-bold text-[var(--accent-commoner)] transition-colors hover:bg-[var(--accent-commoner)] hover:text-white">
                  <ThumbsDown aria-hidden="true" className="h-6 w-6"/>
                  ไม่ใช่ — คนอื่นแน่ๆ
                </button>
              </div>
            </div>) : (<div className="space-y-4">
              <div>
                <h2 className="font-display text-xl font-bold">เลือกผู้ต้องสงสัยว่าเป็นอินไซเดอร์</h2>
                <p className="mt-1 text-xs text-[var(--ink-secondary)]">
                  เลือกคนที่คุณคิดว่าแอบรู้คำลับตั้งแต่ต้น (ไม่สามารถเลือกมาสเตอร์หรือตัวเองได้)
                </p>
              </div>

              <div className="space-y-2">
                {suspectCandidates.map((candidate) => {
                const selected = selectedSuspectId === candidate.id;
                return (<button key={candidate.id} type="button" data-testid={`suspect-option-${candidate.name}`} onClick={() => setSelectedSuspectId(candidate.id)} className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-colors ${selected
                        ? 'border-[var(--accent-insider)] bg-[var(--accent-insider)]/10'
                        : 'border-[var(--border-card)] bg-[var(--bg-table)] hover:border-[var(--ink-secondary)]'}`}>
                      <div className="flex items-center gap-3">
                        <PlayerAvatar name={candidate.name} avatar={candidate.avatar} isBot={candidate.isBot} size="sm"/>
                        <span className="font-semibold">{candidate.name}</span>
                      </div>
                      {selected && (<span className="text-xs font-bold text-[var(--accent-insider)]">
                          เลือกแล้ว
                        </span>)}
                    </button>);
            })}
              </div>

              <button type="button" data-testid="btn-confirm-suspect-vote" disabled={!selectedSuspectId} onClick={() => {
                if (selectedSuspectId) {
                    sound.voteCast();
                    void voteSuspect(selectedSuspectId);
                }
            }} className="w-full rounded-xl bg-[var(--accent-insider)] py-3 text-sm font-bold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45">
                ยืนยันผลโหวต
              </button>
            </div>)}
        </section>

        <section className="tabletop-card rounded-2xl p-5">
          <h3 className="mb-3 font-display text-sm font-bold text-[var(--ink-secondary)]">
            สถานะการโหวต
          </h3>
          <PlayerList players={players} myId={me.id} guesserId={voting.guesserId} votedPlayerIds={voting.votedPlayerIds}/>
        </section>
      </div>
    </div>);
}
