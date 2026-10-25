export type Permit = 'C' | 'CE';

export interface DashboardProgress {
    writtenPracticed: number;
    writtenCorrect: number;
    oralStudied: number;
    checksStudied: number;
}

export interface DashboardState {
    selectedPermit: Permit;
    progressByPermit: Record<Permit, DashboardProgress>;
}

export interface DashboardProgressCard {
    label: string;
    value: number;
    total: number;
    detail: string;
}

export interface DashboardActivity {
    title: string;
    description: string;
    badge: string;
    action: string;
    path: string;
    icon: string;
}