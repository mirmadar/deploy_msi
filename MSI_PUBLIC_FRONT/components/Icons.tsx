type IconProps = {
  name?: string | null;
  className?: string;
};

export function Icon({ name, className }: IconProps) {
  if (!name) return null;

  return (
    <svg className={className} aria-hidden="true">
      <use href={`/icons/categories/sprite.svg#${name}`} />
    </svg>
  );
}
