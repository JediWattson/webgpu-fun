import style from "./style.module.css";

export type SelectPropsType = {
  dataArr?: any[];
  mapCallback: (data: any) => { value: string; label: string };
  onChange: (value: string) => void;
};

const Select = ({ dataArr, mapCallback, onChange }: SelectPropsType) => {
  return (
    <select
      className={style.selectContainer}
      onChange={(e) => onChange(e.target.value)}
    >
      {dataArr?.map((data: any) => {
        const { value, label } = mapCallback(data);
        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
};

export default Select;
