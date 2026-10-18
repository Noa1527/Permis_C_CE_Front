import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardService } from 'src/app/core/dashboard/dashboard.service';
import { Permit } from 'src/app/core/dashboard/dashboard.types';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
    private readonly _dashboardService = inject(DashboardService);

    public permits = this._dashboardService.permits;
    public activities = this._dashboardService.activities;

    public selectedPermit = this._dashboardService.selectedPermit;
    public progress = this._dashboardService.progress;
    public hasProgress = this._dashboardService.hasProgress;
    public progressCards = this._dashboardService.progressCards;

    selectPermit(permit: Permit): void {
        this._dashboardService.selectPermit(permit);
    }

    percentage(value: number, total: number): number {
        if (total <= 0) {
            return 0;
        }

        return Math.min(
            100,
            Math.max(0, Math.round((value / total) * 100)),
        );
    }
}