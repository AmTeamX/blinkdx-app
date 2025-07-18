// Update the SummaryCardProps interface and component
interface SummaryCardProps {
    title: string;
    value: number | string | undefined;  // Allow string values from API
    unit: string;
    color: 'green' | 'blue' | 'black';
    precision?: number;
}

export const SummaryCard = ({ title, value, unit, color, precision = 0 }: SummaryCardProps) => {
    const colorClasses = {
        green: 'border-black bg-white text-green-800',
        blue: 'border-black bg-white text-blue-800',
        black: 'border-black bg-white text-black'
    };

    // Helper function to format the value
    const formatValue = () => {
        if (value === undefined || value === null) return 'N/A';

        const numValue = typeof value === 'string' ? parseFloat(value) : value;

        if (isNaN(numValue)) return value;  // Return string as-is if not a number
        return numValue.toFixed(precision);
    };

    return (
        <div className={`p-2 rounded border ${colorClasses[color]}`}>
            <div className="text-xs font-medium">{title}</div>
            <div className="text-lg font-bold">
                {formatValue()}
                {unit && <span className="text-sm ml-1">{unit}</span>}
            </div>
        </div>
    );
};