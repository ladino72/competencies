import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import accessRights from "./access.json";

export default function defineAbilityFor(user) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    console.log("ROLE:", user?.role);

    if (user?.role === "admin") {
        can(accessRights.admin.subject, accessRights.admin.action);
    } else if (user?.role === "teacher") {
        can(accessRights.teacher.action, accessRights.teacher.subject);
    } else if (user?.role === "coordinator") {
        can(accessRights.coordinator.action, accessRights.coordinator.subject);
    } else if (user?.role === "director") {
        can(accessRights.director.action, accessRights.director.subject);
    } else {   //student
        can(accessRights.student.action, accessRights.student.subject);

    }
    // cannot("delete", "Products");

    return build();
}