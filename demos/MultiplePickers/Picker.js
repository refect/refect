import React from 'react';
import { Select } from 'antd';

const Option = Select.Option;

export default function Picker(props) {
  const { onChange, onSelect, data } = props;
  const options = data.map(({ text, value }) => {
    return (
      <Option key={value}>{text}</Option>
    );
  });

  return (
    <Select
      combobox
      value={props.value}
      style={{ width: 300, marginLeft: 10 }}
      placeholder="please input ..."
      notFoundContent="not found"
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onChange={onChange}
      onSelect={onSelect}
    >
      {options}
    </Select>
  );
}
