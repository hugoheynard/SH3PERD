import { ValueObject } from '../../../utils/entities/ValueObject.js';
import type {
  TVersionTrackDomainModel,
  TAudioAnalysisSnapshot,
  TVersionTrackId,
} from '@sh3pherd/shared-types';

/**
 * Value Object representing a single audio file attached to a version.
 * Immutable except for `favorite` and `analysisResult` which are set post-creation.
 */
export class VersionTrackVO extends ValueObject<TVersionTrackDomainModel> {
  constructor(props: TVersionTrackDomainModel) {
    super(props);
  }

  get id(): TVersionTrackId {
    return this.props.id;
  }
  get fileName(): string {
    return this.props.fileName;
  }
  get durationSeconds(): number | undefined {
    return this.props.durationSeconds;
  }
  get uploadedAt(): number {
    return this.props.uploadedAt;
  }
  get analysisResult(): TAudioAnalysisSnapshot | undefined {
    return this.props.analysisResult;
  }
  get isFavorite(): boolean {
    return this.props.favorite;
  }
  get quality(): number | undefined {
    return this.props.analysisResult?.quality;
  }

  /** Create a new VO with favorite set. Returns a new instance (VOs are immutable). */
  withFavorite(favorite: boolean): VersionTrackVO {
    return new VersionTrackVO({ ...this.props, favorite });
  }

  /** Create a new VO with analysis result attached. */
  withAnalysis(snapshot: TAudioAnalysisSnapshot): VersionTrackVO {
    return new VersionTrackVO({ ...this.props, analysisResult: snapshot });
  }

  /** The S3 storage key for this track, given owner and version context. */
  buildS3Key(ownerId: string, versionId: string): string {
    return `tracks/${ownerId}/${versionId}/${this.id}/${this.fileName}`;
  }
}
