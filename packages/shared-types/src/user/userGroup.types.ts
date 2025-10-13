export type TUserGroupId = `userGroup_${string}`;

export type TUserGroupDomainModel = {
  id:TUserGroupId;
  name:string;
  description?:string;
  users:TUserGroupId[];
}