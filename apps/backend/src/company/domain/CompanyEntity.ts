import { Entity, type TEntityInput } from '../../utils/entities/Entity.js';
import type { TCompanyAddress, TCompanyChannel, TCompanyDomainModel, TCompanyIntegration } from '@sh3pherd/shared-types';


/**
 * Company entity — a simple record representing an organisation.
 *
 * Access control is managed through Contracts (roles) and OrgNodes (membership).
 * This entity only handles company-level data: name, description, address, orgLayers, channels, status.
 */
export class CompanyEntity extends Entity<TCompanyDomainModel> {
  /** Default org layer labels applied when creating a company */
  static readonly DEFAULT_ORG_LAYERS: string[] = ['Department', 'Team', 'Sub-team'];

  constructor(props: Omit<TEntityInput<TCompanyDomainModel>, 'orgLayers' | 'integrations' | 'channels'> & { orgLayers?: string[]; integrations?: TCompanyIntegration[]; channels?: TCompanyChannel[] }) {
    super(
      {
        ...props,
        orgLayers: props.orgLayers ?? CompanyEntity.DEFAULT_ORG_LAYERS,
        integrations: props.integrations ?? [],
        channels: props.channels ?? [],
      } as TEntityInput<TCompanyDomainModel>,
      'company',
    );
  }

  rename(name: string): void {
    this.props = { ...this.props, name };
  }

  updateInfo(fields: { name?: string; description?: string; address?: TCompanyAddress }): void {
    this.props = { ...this.props, ...fields };
  }

  /** Replace the company's org layer labels */
  updateOrgLayers(layers: string[]): void {
    this.props = { ...this.props, orgLayers: layers };
  }

  /** Replace all integrations */
  updateIntegrations(integrations: TCompanyIntegration[]): void {
    this.props = { ...this.props, integrations };
  }

  /** Replace all channels */
  updateChannels(channels: TCompanyChannel[]): void {
    this.props = { ...this.props, channels };
  }

  updateStatus(status: TCompanyDomainModel['status']): void {
    this.props = { ...this.props, status };
  }
}
