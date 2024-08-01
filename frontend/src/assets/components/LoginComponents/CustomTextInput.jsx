import { useField } from 'formik';

const CustomTextInput = ({ label, fullWidth, ...props }) => {
    const [field, meta] = useField(props);

    return (
        <div className={`flex flex-col mb-4 ${fullWidth ? 'w-full' : ''}`}>
            <label htmlFor={props.name} className="mb-1 text-normal font-bold">
                {label}:
            </label>
            <input
                {...field}
                {...props}
                className={`appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline 
                ${meta.touched && meta.error ? 'border-red-500' : ''}`}
            />
            {meta.touched && meta.error ? (
                <div className="text-red-500 text-sm mt-1">{meta.error}</div>
            ) : null}
        </div>
    );
};

export default CustomTextInput;
