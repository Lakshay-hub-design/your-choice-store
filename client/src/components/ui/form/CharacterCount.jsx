export default function CharacterCount({ current, max }) {
  return (
    <p className="mt-1 text-right text-[10px] text-[#9CA3AF]">
      {current}/{max}
    </p>
  );
}
