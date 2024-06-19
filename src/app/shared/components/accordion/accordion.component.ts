import { Component, ContentChildren, QueryList, AfterContentInit, OnInit } from '@angular/core';
import { AccordionItemComponent } from '../accordion-item/accordion-item.component';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss']
})

export class AccordionComponent implements OnInit, AfterContentInit {
  @ContentChildren(AccordionItemComponent) items: QueryList<AccordionItemComponent>;
  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit() {

    // this.items.toArray()[0].isOpen = true;  // If we need to open item in the start state

    this.items.toArray().forEach((item) => {
      item.Toggle.subscribe(() => {
        this.itemToggleHandler(item);
      });
    });
  }

  itemToggleHandler(item: AccordionItemComponent) {

    // this.items.toArray().forEach(item => item.isOpen = false);  // TODO: if we need close opened items

  }

}
