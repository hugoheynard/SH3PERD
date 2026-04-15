import { Injectable } from '@nestjs/common';
import type { IQuery, QueryBus } from '@nestjs/cqrs';

@Injectable()
export class AppQueryBus {
  constructor(private readonly queryBus: QueryBus) {}

  async execute<Q extends IQuery, R = unknown>(query: Q): Promise<R> {
    // cast explicite pour informer TS du type attendu
    return (await this.queryBus.execute(query)) as R;
  }
}
