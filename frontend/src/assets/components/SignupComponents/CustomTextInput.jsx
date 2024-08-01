import { useField } from 'formik';

const CustomTextInput = ({ label, ...props }) => {
    const [field, meta] = useField(props);

    return (
        <div className="flex flex-col">
            <label htmlFor={props.name} className="mb-1 text-normal font-bold">
                {label}:
            </label>
            <input
                {...field}
                {...props}
                className={`appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline 
                ${meta.touched && meta.error ? 'border-red-500' : ''}`}
            />
            {meta.touched && meta.error && (
                <div className="text-red-500">{meta.error}</div>
            )}
        </div>
    );
};

export default CustomTextInput;