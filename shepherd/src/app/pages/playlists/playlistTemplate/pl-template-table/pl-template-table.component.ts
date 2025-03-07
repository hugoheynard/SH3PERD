import {Component, inject, OnInit} from '@angular/core';
import {PlTemplateService} from '../../../../services/pl-template.service';

@Component({
  selector: 'pl-template-table',
  imports: [],
  templateUrl: './pl-template-table.component.html',
  standalone: true,
  styleUrl: './pl-template-table.component.scss'
})
export class PlTemplateTableComponent implements OnInit {
  private pltServ: PlTemplateService = inject(PlTemplateService);
  public plTemplates: any = [];

  async ngOnInit(): Promise<void> {
    this.plTemplates = await this.pltServ.getPlTemplates();
    console.log(this.plTemplates)
  };
}
