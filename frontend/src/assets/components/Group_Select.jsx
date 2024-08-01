import { useState, useEffect } from 'react'
import { RadioGroup } from '@headlessui/react'


export default function Group_Select({ CourseGroup, cb_Group }) {

    const [selectedAGroup, setSelectedAGroup] = useState(CourseGroup[0]);

    useEffect(() => {
        cb_Group(selectedAGroup)
    }, [selectedAGroup]);



    return (
        <div className="w-full px-4 py-4">
            <div className="mx-auto w-full max-w-md">
                <RadioGroup value={selectedAGroup} onChange={setSelectedAGroup}>
                    <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
                    <div className="space-y-2">
                        {CourseGroup.map((plan) => (
                            <RadioGroup.Option
                                key={plan.group_number}
                                value={plan}
                                className={({ active, checked }) =>
                                    `${active
                                        ? 'ring-2 ring-white ring-opacity-60 ring-offset-2 ring-offset-sky-300'
                                        : ''
                                    }
                  ${checked ? 'bg-sky-900 bg-opacity-75 text-white' : 'bg-white'
                                    }
                    relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md focus:outline-none`
                                }
                            >
                                {({ active, checked }) => (
                                    <>
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="text-sm">
                                                    <RadioGroup.Label
                                                        as="p"
                                                        className={`font-medium  ${checked ? 'text-white' : 'text-gray-900'
                                                            }`}
                                                    >
                                                        {plan.group_number}
                                                    </RadioGroup.Label>
                                                    <RadioGroup.Description
                                                        as="span"
                                                        className={`inline ${checked ? 'text-sky-100' : 'text-gray-500'
                                                            }`}
                                                    >
                                                        <span>
                                                            {plan.teacher_name}
                                                        </span>{' '}

                                                    </RadioGroup.Description>
                                                </div>
                                            </div>
                                            {checked && (
                                                <div className="shrink-0 text-white">
                                                    <CheckIcon className="h-6 w-6" />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </RadioGroup.Option>
                        ))}
                    </div>
                </RadioGroup>
            </div>
        </div>
    )
}

function CheckIcon(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" {...props}>
            <circle cx={12} cy={12} r={12} fill="#fff" opacity="0.2" />
            <path
                d="M7 13l3 3 7-7"
                stroke="#fff"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}
