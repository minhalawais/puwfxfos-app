import { create } from 'zustand';
import type { WorkerOnboardingDraft } from '@/features/worker-onboarding/types';

type Role = 'worker' | 'union_admin' | null;

interface SessionState {
  role: Role;
  workerOnboarded: boolean;
  workerOnboardingDraft: WorkerOnboardingDraft;
  signInUnionAdmin: () => void;
  updateWorkerOnboardingDraft: (draft: Partial<WorkerOnboardingDraft>) => void;
  resetWorkerOnboardingDraft: () => void;
  completeWorkerOnboarding: (draft?: WorkerOnboardingDraft) => void;
  signOut: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  role: null,
  workerOnboarded: false,
  workerOnboardingDraft: {},
  signInUnionAdmin: () => set({ role: 'union_admin' }),
  updateWorkerOnboardingDraft: (draft) => set((state) => ({ workerOnboardingDraft: { ...state.workerOnboardingDraft, ...draft } })),
  resetWorkerOnboardingDraft: () => set({ workerOnboardingDraft: {} }),
  completeWorkerOnboarding: (draft) => set((state) => ({ role: 'worker', workerOnboarded: true, workerOnboardingDraft: draft ?? state.workerOnboardingDraft })),
  signOut: () => set({ role: null, workerOnboarded: false, workerOnboardingDraft: {} }),
}));
