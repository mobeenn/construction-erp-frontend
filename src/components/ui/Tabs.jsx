export default function Tabs({ options, value, onChange, label = "Sections" }) {
   return (
      <div role="tablist" aria-label={label} className="segmented-tabs">
         {options.map((option) => {
            const selected = value === option.value;
            return (
               <button
                  key={option.value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => onChange(option.value)}
                  className={`segmented-tab${selected ? " is-active" : ""}`}
               >
                  {option.label}
               </button>
            );
         })}
      </div>
   );
}
