import { Environment } from '@/lib/api';

interface EnvironmentBadgeProps {
    env: Environment;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
};

export default function EnvironmentBadge({ env, size = 'md' }: EnvironmentBadgeProps) {
    const badgeClass = `badge-${env}`;

    return (
        <span
            className={`inline-flex items-center rounded-full font-medium text-white ${badgeClass} ${sizeClasses[size]}`}
        >
            {env.toUpperCase()}
        </span>
    );
}
