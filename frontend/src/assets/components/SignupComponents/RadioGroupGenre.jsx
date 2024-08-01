import { useField } from 'formik';

const RadioGroupGenre = ({ label, options, ...props }) => {
    const [field, meta, { setFieldTouched }] = useField(props);
    return (
        <div role="group" aria-labelledby={`${props.name}-group`} className="flex flex-col mb-2">
            <label id={`${props.name}-group`} className="font-bold">
                {label}:
            </label>
            <div className="flex items-center justify-between space-x-16"> {/* Horizontal alignment */}
                {options.map((option) => (
                    <label
                        key={option.value}
                        className={`flex items-center ${field.value === option.value ? 'text-blue-500' : ''}`}
                    >
                        <input
                            type="radio"
                            {...field}
                            value={option.value}
                            checked={field.value === option.value}
                            className="mr-2 focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm">{option.label}</span> {/* Option text */}
                    </label>
                ))}
            </div>
            {meta.error && meta.touched && <div className="text-red-500">{meta.error}</div>}
        </div>
    );
};

export default RadioGroupGenre;

