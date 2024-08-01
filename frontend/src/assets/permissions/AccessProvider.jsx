import { AbilityContext } from "./Can";

import defineAbilityFor from "./permissions";
import { useAuth } from "./AuthContext";

//Alternate way to define ability
// const ability = defineAbility((can, cannot) => {
//   can("read", "Post");
//   cannot("delete", "Post", { published: true });
// });

export default function AccessProvider(props) {
    const { user } = useAuth();

    return (
        <AbilityContext.Provider value={defineAbilityFor(user)}>
            {props.children}
        </AbilityContext.Provider>
    );
}