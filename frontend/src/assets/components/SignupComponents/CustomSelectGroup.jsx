import React from 'react';
import { useField } from 'formik';

const CustomSelectGroup = ({ label, options, ...props }) => {
    const [field, meta, helpers] = useField(props.name);
    // Call setTouched on focus or blur
    const handleFocus = () => helpers.setTouched(props.name);
    const handleBlur = () => helpers.setTouched(props.name);
    const selectGrroupClassName = `rounded px-2 py-1 border focus:outline-none ${meta.touched && field.value !== '' ? 'border-blue-500 text-blue-500' : ''}`;
    const labelClassName = `${meta.touched && field.value !== '' ? 'text-blue-500' : ''}`;


    return (
        <div className="flex flex-col">
            <label className={labelClassName} htmlFor={props.name}>{label}:</label>
            <select
                {...field}
                {...props}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={selectGrroupClassName}

            >
                <option value="">None</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {meta.touched && meta.error && <div className="text-red-500">{meta.error}</div>}
        </div>
    );
};

export default CustomSelectGroup;
