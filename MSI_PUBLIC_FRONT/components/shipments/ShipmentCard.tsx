import { ShipmentPost } from '@/types/api';

export function ShipmentCard({ post }: { post: ShipmentPost }) {
  return (
    <div className="card-shadow bg-white rounded-xl p-4 flex flex-col gap-3">
      <div className="w-full aspect-[3/4] rounded-md overflow-hidden flex-shrink-0 bg-slate-100">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-full object-contain"
        />
      </div>

      <h3 className="font-semibold text-lg">{post.title}</h3>

      <p className="text-sm text-gray-600 whitespace-pre-line">{post.description}</p>
    </div>
  );
}
