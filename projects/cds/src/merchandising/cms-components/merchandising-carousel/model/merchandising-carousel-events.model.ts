import { ProfileTagEvent } from '../../../../profiletag/index';
import { MerchandisingMetadata } from '../../../model/index';

export interface CarouselEvent {
  carouselId: string;
  carouselName: string;
  strategyId: string;
  metadata?: MerchandisingMetadata;
}

export class MerchandisingCarouselViewedEvent implements ProfileTagEvent {
  name = 'CarouselViewed';
  data: any;
  constructor(carouselEvent: CarouselEvent, productSkus: string[]) {
    this.data = {
      ...carouselEvent,
      productSkus,
    };
  }
}

export class MerchandisingCarouselClickedEvent implements ProfileTagEvent {
  name = 'CarouselClicked';
  data: any;
  constructor(
    carouselEvent: CarouselEvent,
    slotId: string,
    sku: string,
    imageUrl: string
  ) {
    this.data = {
      ...carouselEvent,
      slotId,
      sku,
      imageUrl,
    };
  }
}
