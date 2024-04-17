import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import FilterInformation from "@/types/filter-information";
import {useQueryState} from "nuqs";

interface FilterProps {
    filter: FilterInformation;
    paramType: string;
}

const Filter = ({filter, paramType}: FilterProps) => {
    const setTypeParam = useQueryState(paramType)[1];

    const items = filter.filterItem;

    const handleValueChange = async (value: string) => {
        await setTypeParam(value);
    };

    return (
        <Select onValueChange={handleValueChange}>
            <SelectTrigger className="h-10 w-[180px] ">
                <SelectValue placeholder={paramType} />
            </SelectTrigger>
            <SelectContent>
                {items.map((item) => {
                    return (
                        <SelectItem key={item.value} value={item.value}>
                            {item.value}
                        </SelectItem>
                    );
                })}
            </SelectContent>
        </Select>
    );
};
export default Filter;
