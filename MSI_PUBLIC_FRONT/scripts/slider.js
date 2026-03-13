const sliderRef = useRef<HTMLDivElement>(null);

const scrollRight = () => {
  sliderRef.current?.scrollBy({
    left: 340, // ширина карточки + gap
    behavior: 'smooth',
  });
};
