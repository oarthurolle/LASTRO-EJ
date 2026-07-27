interface AdminTopbarProps {
  breadcrumb: string;
}

export default function AdminTopbar({ breadcrumb }: AdminTopbarProps) {
  return (
    <div className="topbar">
      <div className="breadcrumb"><b>Cases de Sucesso</b> · {breadcrumb}</div>
      <div className="admin-user">
        <div className="who"><strong>Gustavo Torres</strong><span>Administrador</span></div>
        <div className="avatar">GT</div>
      </div>
    </div>
  );
}