import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Dialog,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { UsersApi } from "../../api/users.api";
import { UserForm } from "./UserForm";
import { useUsers } from "./hooks/useUsers";
import { styles } from "./styles/UsersList.styles";

export const UsersList = () => {
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { users, loading, error: fetchError, refresh } = useUsers();

  const handleCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await UsersApi.remove(userToDelete.userId);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      refresh();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при удалении пользователя";
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDialogClose = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingId(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    refresh();
  };

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Box sx={styles.headerContainer}>
        <Box sx={styles.header}>
          <Typography variant="h5" sx={styles.title}>
            Пользователи
          </Typography>
          {users.length > 0 && (
            <Chip label={users.length} size="small" sx={styles.chip} />
          )}
        </Box>
      </Box>

      <Box sx={styles.actionsContainer}>
        <Box sx={styles.actionsLeft}></Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={styles.addButton}
        >
          Создать пользователя
        </Button>
      </Box>

      {(error || fetchError) && (
        <Alert severity="error" sx={styles.errorAlert}>
          {error || fetchError}
        </Alert>
      )}

      {loading ? (
        <Box sx={styles.loadingBox}>
          <Typography>Загрузка...</Typography>
        </Box>
      ) : users.length === 0 ? (
        <Box sx={styles.emptyBox}>
          <Typography color="text.secondary">
            Пользователи не созданы
          </Typography>
        </Box>
      ) : (
        <Box sx={styles.tableContainer}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={styles.tableHeaderRow}>
                  <TableCell sx={styles.idHeaderCell}>
                    <Typography variant="subtitle2">ID</Typography>
                  </TableCell>
                  <TableCell sx={styles.headerCell}>
                    <Typography variant="subtitle2">Email</Typography>
                  </TableCell>
                  <TableCell sx={styles.headerCell}>
                    <Typography variant="subtitle2">Имя пользователя</Typography>
                  </TableCell>
                  <TableCell sx={styles.headerCell}>
                    <Typography variant="subtitle2">Роли</Typography>
                  </TableCell>
                  <TableCell sx={styles.actionsHeaderCell}>
                    <Typography variant="subtitle2">Действия</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId} hover sx={styles.tableRow}>
                    <TableCell sx={styles.idCell}>
                      <Box sx={styles.cellContent}>
                        <Typography variant="body2" sx={styles.idText}>
                          #{user.userId}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={styles.dataCell}>
                      <Box sx={styles.cellContent}>
                        <Typography variant="body2" sx={styles.dataText}>
                          {user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={styles.dataCell}>
                      <Box sx={styles.cellContent}>
                        <Typography variant="body2" sx={styles.dataText}>
                          {user.username}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={styles.dataCell}>
                      <Box sx={styles.cellContent}>
                        {user.roles && user.roles.length > 0 ? (
                          <Box sx={styles.rolesContainer}>
                            {user.roles.map((role, index) => (
                              <Chip
                                key={index}
                                label={role.value}
                                size="small"
                                sx={styles.roleChip}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Нет ролей
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={styles.actionsCell}>
                      <Box sx={styles.cellContent}>
                        <Tooltip title="Редактировать" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(user.userId)}
                            sx={styles.editButton}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(user)}
                            sx={styles.deleteButton}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog
        open={formOpen}
        onClose={handleFormClose}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: styles.dialogPaper,
        }}
      >
        <Box sx={styles.dialogContent}>
          <UserForm
            id={editingId}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </Box>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={styles.deleteDialogContent}>
          <Typography variant="h6" sx={styles.deleteDialogTitle}>
            Удаление пользователя
          </Typography>
          <Typography sx={styles.deleteDialogText}>
            Вы уверены, что хотите удалить пользователя{" "}
            <strong>{userToDelete?.username}</strong> ({userToDelete?.email})?
            Это действие нельзя отменить.
          </Typography>
          <Box sx={styles.deleteDialogActions}>
            <Button
              onClick={handleDeleteDialogClose}
              disabled={isDeleting}
              variant="outlined"
            >
              Отмена
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              variant="contained"
              color="error"
            >
              {isDeleting ? "Удаление..." : "Удалить"}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Paper>
  );
};

