'use client';

import { OptionGroupInput } from "../action";
import { useState } from "react";

interface OptionManagerProps {
    groups: OptionGroupInput[];
    onChange: (groups: OptionGroupInput[]) => void;
}

export default function OptionManager({ groups, onChange }: OptionManagerProps) {
    
    const handleAddGroup = () => {
        onChange([
            ...groups,
            {
                name: "",
                isMultiple: false,
                isRequired: false,
                values: []
            }
        ]);
    };

    const handleRemoveGroup = (index: number) => {
        const newGroups = [...groups];
        newGroups.splice(index, 1);
        onChange(newGroups);
    };

    const updateGroup = (index: number, updates: Partial<OptionGroupInput>) => {
        const newGroups = [...groups];
        newGroups[index] = { ...newGroups[index], ...updates };
        onChange(newGroups);
    };

    const handleAddOption = (groupIndex: number) => {
        const newGroups = [...groups];
        newGroups[groupIndex].values.push({ name: "", price: 0 });
        onChange(newGroups);
    };

    const handleRemoveOption = (groupIndex: number, optionIndex: number) => {
        const newGroups = [...groups];
        newGroups[groupIndex].values.splice(optionIndex, 1);
        onChange(newGroups);
    };

    const updateOption = (groupIndex: number, optionIndex: number, field: 'name' | 'price', value: string | number) => {
        const newGroups = [...groups];
        // @ts-ignore
        newGroups[groupIndex].values[optionIndex][field] = value;
        onChange(newGroups);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Option Groups</h3>
            </div>
            
            {groups.map((group, gIndex) => (
                <div key={gIndex} className="bg-gray-50/50 p-4 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-gray-300">
                    <div className="flex justify-between items-start mb-4 gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Group Name</label>
                                <input
                                    type="text"
                                    value={group.name}
                                    onChange={(e) => updateGroup(gIndex, { name: e.target.value })}
                                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border bg-white"
                                    placeholder="e.g. Size, Toppings"
                                />
                            </div>
                            <div className="flex items-center space-x-6 pt-6">
                                <label className="flex items-center space-x-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={group.isMultiple}
                                        onChange={(e) => updateGroup(gIndex, { isMultiple: e.target.checked })}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Allow Multiple</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={group.isRequired}
                                        onChange={(e) => updateGroup(gIndex, { isRequired: e.target.checked })}
                                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Required</span>
                                </label>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemoveGroup(gIndex)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Remove Group"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                             </svg>
                        </button>
                    </div>

                    <div className="pl-4 border-l-2 border-orange-100/50 ml-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Options</label>
                        <div className="space-y-2">
                            {group.values.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center space-x-3">
                                    <input
                                        type="text"
                                        value={option.name}
                                        onChange={(e) => updateOption(gIndex, oIndex, 'name', e.target.value)}
                                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border bg-white"
                                        placeholder="Option Name"
                                    />
                                    <div className="relative rounded-lg shadow-sm w-32">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">Rp</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={option.price}
                                            onChange={(e) => updateOption(gIndex, oIndex, 'price', parseFloat(e.target.value))}
                                            className="block w-full rounded-lg border-gray-300 pl-8 pr-3 focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-2 border bg-white"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(gIndex, oIndex)}
                                        className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                        title="Remove Option"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => handleAddOption(gIndex)}
                            className="mt-3 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center px-2 py-1 rounded hover:bg-orange-50 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Add Option
                        </button>
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={handleAddGroup}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50/30 transition-all font-medium text-sm flex items-center justify-center"
            >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Add Option Group
            </button>
        </div>
    );
}
