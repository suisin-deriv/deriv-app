import React from 'react';
import { twMerge } from 'tailwind-merge';
import { TModalComponents } from './Modal';

/**
 * ModalContent component
 * @param {TModalComponents} props - The properties that define the ModalContent component.
 * @property {ReactNode} children - Children nodes
 * @property {string} [className] - Optional CSS class name
 * @returns {JSX.Element} The ModalContent component.
 */
const ModalContent = ({ children, className }: TModalComponents) => (
    <div className={twMerge('flex-grow overflow-y-auto p-0 sm:p-8 lg:flex-none', className)}>{children}</div>
);

export default ModalContent;
