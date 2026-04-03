export namespace Model {
  export type Payload = Record<string, unknown>;

  export interface ResolvedColumn {}

  export interface Outcome {
    label: string;
    value: string;
  }

  export interface FormLayout {
    outcomes?: Outcome[];
  }

  export interface CommonFormProps {
    config: FormLayout;
    onChange?: (payload: Payload) => void;
    onOutcomePressed?: (
      payload: Payload,
      result: unknown,
      navigationUrl?: string,
      outcomeConfig?: ResolvedColumn
    ) => void;
  }
}

export function render(_element: Element, _props: Model.CommonFormProps & {payload?: Model.Payload}) {
  return {
    destroy(): void {}
  };
}
