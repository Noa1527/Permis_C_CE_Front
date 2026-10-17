import { Component } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  public navigation = [
    {
        label: 'Accueil',
        path: '/dashboard',
        exact: true,
        icon:
            'M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10',
    },
    {
        label: 'Révisions',
        path: '/revisions',
        exact: false,
        icon:
            'M12 5v16M12 5C9 3 5 3 2 4v16c3-1 7-1 10 1M12 5c3-2 7-2 10-1v16c-3-1-7-1-10 1',
    },
    {
        label: 'Examens',
        path: '/examens',
        exact: false,
        icon:
            'M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3M9 2h6v4H9zM8 14l3 3 5-6',
    },
    {
        label: 'Profil',
        path: '/profil',
        exact: false,
        icon:
            'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',
    },
];
}