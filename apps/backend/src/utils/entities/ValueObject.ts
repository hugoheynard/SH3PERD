/**
 * Abstract base class for value objects.
 * Implements equality based on properties.
 * @template TProps - Shape of the value object's properties.
 */
export abstract class ValueObject<TProps extends object> {
  protected readonly props: TProps;

  protected constructor(props: TProps) {
    this.props = Object.freeze({ ...props });
  }

  equals(vo?: ValueObject<TProps>): boolean {
    if (!vo) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }

  get value(): TProps {
    return this.props;
  }
}