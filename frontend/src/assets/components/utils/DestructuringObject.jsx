import React from 'react'

function DestructuringObject(obj, numTimes) {
    {/*Destructures an object a huge number of times and renames each property of the object to a different name.
      
        Args:
          obj: The object to destructure.
          numTimes: The number of times to destructure the object.
      
        Returns:
          A list of objects, each of which is a destructured version of the original object with unique property names.
    */}

    // Create a list to store the destructured objects.
    const destructuredObjects = [];

    // Destructure the object the specified number of times.
    for (let i = 0; i < numTimes; i++) {
        // Create a new object to store the destructured properties.
        const newObj = {};

        // Iterate over the properties of the original object.
        for (const [key, value] of Object.entries(obj)) {
            // Generate a unique property name for the current property.
            const newKey = `${key}${i}`;

            // Add the property to the new object.
            newObj[newKey] = value;
        }

        // Add the new object to the list of destructured objects.
        destructuredObjects.push(newObj);
    }

    return destructuredObjects;
}



export default DestructuringObject