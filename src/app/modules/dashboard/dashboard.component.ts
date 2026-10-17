import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
    inject,
} from '@angular/core';
import {
    FormBuilder,
    ReactiveFormsModule,
} from '@angular/forms';



@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        ReactiveFormsModule,
    ],
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit{
    @ViewChild('weightDialog')
    private Dialog!: ElementRef<HTMLDialogElement>;

    private readonly fb = inject(FormBuilder);

    constructor() {}    

    public ngOnInit(): void {
        
    }
}