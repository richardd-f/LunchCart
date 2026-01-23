"use client"

import { useState, useTransition } from 'react'
import { AddToCartInput, MealWithDetails, addToCart } from '../action'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface AddToCartModalProps {
    meal: MealWithDetails
    isOpen: boolean
    onClose: () => void
}

export default function AddToCartModal({ meal, isOpen, onClose }: AddToCartModalProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    
    // State
    const [quantity, setQuantity] = useState(1)
    const [notes, setNotes] = useState("")
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
    // Structure: { [groupId]: [valueId1, valueId2] }

    if (!isOpen) return null

    // -- Handlers --

    const handleOptionChange = (groupId: string, valueId: string, isMultiple: boolean) => {
        setSelectedOptions(prev => {
            const current = prev[groupId] || []
            
            if (isMultiple) {
                // Toggle Checkbox
                if (current.includes(valueId)) {
                    return { ...prev, [groupId]: current.filter(id => id !== valueId) }
                } else {
                    return { ...prev, [groupId]: [...current, valueId] }
                }
            } else {
                // Radio
                return { ...prev, [groupId]: [valueId] }
            }
        })
    }

    const calculateTotal = () => {
        let total = Number(meal.price)
        
        // Add options price
        Object.values(selectedOptions).flat().forEach(valId => {
            // Find value price - inefficient search but safe for small sizes. 
            // Better to index maps if perf needed.
            meal.optionGroups.forEach(g => {
                const val = g.values.find(v => v.id === valId)
                if (val) total += Number(val.price)
            })
        })
        
        return total * quantity
    }

    const validate = () => {
        for (const group of meal.optionGroups) {
            if (group.isRequired) {
                if (!selectedOptions[group.id] || selectedOptions[group.id].length === 0) {
                    toast.error(`Please select an option for ${group.name}`)
                    return false
                }
            }
        }
        return true
    }

    const handleSubmit = () => {
        if (!validate()) return

        const optionValueIds = Object.values(selectedOptions).flat()

        const payload: AddToCartInput = {
            mealId: meal.id,
            quantity,
            notes,
            optionValueIds
        }

        startTransition(async () => {
            try {
                await addToCart(payload)
                onClose()
                // router.refresh() // action already revalidates, but good to ensure
                toast.success("Added to cart!") 
            } catch (e) {
                console.error(e)
                toast.error("Failed to add to cart")
            }
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Add to Cart</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Header Info */}
                    <div>
                        <h3 className="font-semibold text-gray-800">{meal.name}</h3>
                        <p className="text-[#F97352] font-bold">Rp {Number(meal.price).toLocaleString('id-ID')}</p>
                    </div>

                    {/* Options */}
                    {meal.optionGroups.map(group => (
                        <div key={group.id} className="space-y-3">
                            <div className="flex justify-between">
                                <h4 className="font-medium text-gray-700 text-sm">
                                    {group.name} 
                                    {group.isRequired && <span className="text-red-500 ml-1">*</span>}
                                </h4>
                                <span className="text-xs text-gray-400">
                                    {group.isMultiple ? 'Choose multiple' : 'Choose 1'}
                                </span>
                            </div>
                            
                            <div className="space-y-2">
                                {group.values.map(val => {
                                    const isSelected = selectedOptions[group.id]?.includes(val.id)
                                    return (
                                        <label 
                                            key={val.id} 
                                            className={`
                                                flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
                                                ${isSelected ? 'border-[#F97352] bg-orange-50' : 'border-gray-200 hover:border-orange-200'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type={group.isMultiple ? "checkbox" : "radio"}
                                                    name={group.id} // Group radios by ID
                                                    checked={isSelected || false}
                                                    onChange={() => handleOptionChange(group.id, val.id, group.isMultiple)}
                                                    className="accent-[#F97352] w-4 h-4"
                                                />
                                                <span className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                    {val.name}
                                                </span>
                                            </div>
                                            {Number(val.price) > 0 && (
                                                <span className="text-xs text-gray-500 font-medium">+Rp {Number(val.price).toLocaleString('id-ID')}</span>
                                            )}
                                        </label>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Notes - only show if meal allows notes */}
                    {meal.allowNotes && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Example: No spicy, extra sauce..."
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] text-sm p-3 bg-gray-50 border h-24 resize-none"
                            />
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl space-y-4">
                    <div className="flex items-center justify-center gap-6">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                        </button>
                        <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                        <button 
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="w-full py-3 bg-[#F97352] hover:bg-[#e06241] text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <>
                                <span>Add to Cart</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">
                                    Rp {calculateTotal().toLocaleString('id-ID')}
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
