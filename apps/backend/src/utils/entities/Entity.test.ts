import { Entity, type TId} from './Entity.js';


type TTestPrefs = {
  id: TId<"test">;
  userId: string;
  theme: "light" | "dark";
  value: number;
};

export class TestPreferences extends Entity<TTestPrefs, "test"> {
   constructor(props: TTestPrefs) {
    super("test", props);
  }
}


