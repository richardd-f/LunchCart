'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { disablePhoneReminder } from '../action';

interface PhoneSetupReminderModalProps {
    phoneNumber: string | null | undefined;
    remindPhoneSetup: boolean;
}

export default function PhoneSetupReminderModal({ phoneNumber, remindPhoneSetup }: PhoneSetupReminderModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Show modal if phone number is missing AND user hasn't disabled reminder
        if (!phoneNumber && remindPhoneSetup) {
            setIsOpen(true);
        }
    }, [phoneNumber, remindPhoneSetup]);

    const handleOkay = () => {
        router.push('/settings');
    };

    const handleDontRemind = async () => {
        await disablePhoneReminder();
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
                <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-600">
                             <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Add Your WhatsApp Number</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Get instant notifications when your food is ready! Please add your phone number in settings to enable WhatsApp alerts.
                    </p>
                </div>

                <div className="flex flex-col gap-3 mt-2">
                    <button
                        onClick={handleOkay}
                        className="w-full py-2.5 bg-[#F97352] hover:bg-[#e06241] text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-200"
                    >
                        Okay, go to settings
                    </button>
                    
                    <button
                        onClick={handleDontRemind}
                        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold rounded-xl transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
