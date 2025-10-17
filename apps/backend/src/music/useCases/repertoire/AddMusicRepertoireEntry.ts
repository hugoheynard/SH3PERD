import { Inject, Injectable } from '@nestjs/common';
import { MUSIC_REPERTOIRE_REPO } from '../../../appBootstrap/nestTokens.js';
import type { IMusicRepertoireRepository } from '../../types/musicRepertoire.core.types.js';



@Injectable()
export class AddMusicRepertoireEntry {
  constructor(
    @Inject(MUSIC_REPERTOIRE_REPO) private readonly musRepRepo: IMusicRepertoireRepository
  ) {}

  async execute() {
    console.log(this.musRepRepo);
  };
}