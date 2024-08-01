import { useField } from 'formik';

const CustomPasswordInput = ({ label, ...props }) => {
    const [field, meta] = useField(props);

    return (
        <div className="w-full sm:w-1/2  mb-4">
            <label htmlFor={props.id || props.name} className="mb-1 block font-semibold">
                {label}:
            </label>
            <input
                {...field}
                {...props}
                type="password"
                className="appearance-none border rounded py-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
            />
            {meta.touched && meta.error && (
                <div className="text-red-500 text-sm mt-1">{meta.error}</div>
            )}
        </div>
    );
};

export default CustomPasswordInput;

