interface AutoWidthInputProps {
  value: string;
  placeholder: string;
  className: string;
  onChange: (value: string) => void;
  id?: string;
  ariaLabel?: string;
  autoFocus?: boolean;
}

/** 입력한 숫자 폭만큼만 늘어나는 입력창 — "265,000원"처럼 단위가 숫자 바로 뒤에 붙게 */
export default function AutoWidthInput({
  value,
  placeholder,
  className,
  onChange,
  id,
  ariaLabel,
  autoFocus,
}: AutoWidthInputProps): React.ReactNode {
  return (
    <span className="inline-grid min-w-0">
      <span aria-hidden="true" className={`invisible col-start-1 row-start-1 whitespace-pre ${className}`}>
        {value || placeholder}
      </span>
      <input
        id={id}
        aria-label={ariaLabel}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        // 기본 size(약 20글자) 폭이 남으면 "원"이 멀리 밀려남 → 1로 두고 폭은 옆의 숨은 글자가 정함
        size={1}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`col-start-1 row-start-1 w-full min-w-0 bg-transparent p-0 outline-none placeholder:text-sub/40 ${className}`}
      />
    </span>
  );
}
