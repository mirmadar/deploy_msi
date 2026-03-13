import React, { useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Dialog,
  Chip,
  Snackbar,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { ArticlesApi } from "../../api/articles.api";
import { ArticleForm } from "./ArticleForm";
import { ArticleTable } from "./components/ArticleTable";
import { ArticleBulkActions } from "./components/ArticleBulkActions";
import { TablePagination } from "../../components/common/TablePagination";
import { DeleteConfirmDialog } from "../../components/common/DeleteConfirmDialog";
import { useArticles } from "./hooks/useArticles";
import { useArticleSelection } from "./hooks/useArticleSelection";
import { styles } from "./styles/ArticlesList.styles";

export const ArticlesList = () => {
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [publishSnackbarOpen, setPublishSnackbarOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [unpublishError, setUnpublishError] = useState(null);
  const [unpublishSnackbarOpen, setUnpublishSnackbarOpen] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [bulkActionError, setBulkActionError] = useState(null);
  const [bulkActionSnackbarOpen, setBulkActionSnackbarOpen] = useState(false);
  const [isBulkActioning, setIsBulkActioning] = useState(false);
  const [isMovingOrder, setIsMovingOrder] = useState(false);

  const {
    articles,
    total,
    loading,
    error,
    page,
    rowsPerPage,
    handlePageChange,
    handleRowsPerPageChange,
    refresh,
  } = useArticles();

  const {
    selectedArticles,
    handleSelect,
    handleSelectAll,
    clearSelection,
  } = useArticleSelection();

  const handleCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleDeleteClick = (id) => {
    const article = articles.find((a) => a.articleId === id);
    if (article) {
      setArticleToDelete({
        id,
        name: article.title || "эта статья",
      });
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;

    setIsDeleting(true);
    try {
      await ArticlesApi.remove(articleToDelete.id);
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
      refresh();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при удалении статьи";

      setDeleteError(errorMessage);
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDialogClose = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setDeleteError(null);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingId(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    refresh();
  };

  const handlePublish = async (id) => {
    setIsPublishing(true);
    try {
      await ArticlesApi.publish(id);
      setPublishError(null);
      setPublishSnackbarOpen(true);
      refresh();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при публикации статьи";
      setPublishError(errorMessage);
      setPublishSnackbarOpen(true);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClosePublishSnackbar = () => {
    setPublishSnackbarOpen(false);
    setPublishError(null);
  };

  const handleUnpublish = async (id) => {
    setIsUnpublishing(true);
    try {
      await ArticlesApi.unpublish(id);
      setUnpublishError(null);
      setUnpublishSnackbarOpen(true);
      refresh();
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при снятии статьи с публикации";
      setUnpublishError(errorMessage);
      setUnpublishSnackbarOpen(true);
    } finally {
      setIsUnpublishing(false);
    }
  };

  const handleCloseUnpublishSnackbar = () => {
    setUnpublishSnackbarOpen(false);
    setUnpublishError(null);
  };

  const handleBulkDelete = () => {
    if (!selectedArticles.length) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (!selectedArticles.length) return;

    setIsBulkActioning(true);
    try {
      await ArticlesApi.bulkDelete({ articleIds: selectedArticles });
      setBulkDeleteDialogOpen(false);
      clearSelection();
      refresh();
      setBulkActionError(null);
      setBulkActionSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при массовом удалении статей";
      setBulkActionError(errorMessage);
      setBulkActionSnackbarOpen(true);
      setBulkDeleteDialogOpen(false);
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleBulkDeleteDialogClose = () => {
    if (!isBulkActioning) {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleBulkPublish = async () => {
    if (!selectedArticles.length) return;

    setIsBulkActioning(true);
    try {
      await ArticlesApi.bulkPublish({ articleIds: selectedArticles });
      clearSelection();
      refresh();
      setBulkActionError(null);
      setBulkActionSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при массовой публикации статей";
      setBulkActionError(errorMessage);
      setBulkActionSnackbarOpen(true);
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (!selectedArticles.length) return;

    setIsBulkActioning(true);
    try {
      await ArticlesApi.bulkUnpublish({ articleIds: selectedArticles });
      clearSelection();
      refresh();
      setBulkActionError(null);
      setBulkActionSnackbarOpen(true);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка при массовом снятии статей с публикации";
      setBulkActionError(errorMessage);
      setBulkActionSnackbarOpen(true);
    } finally {
      setIsBulkActioning(false);
    }
  };

  const handleCloseBulkActionSnackbar = () => {
    setBulkActionSnackbarOpen(false);
    setBulkActionError(null);
  };

  const handleMoveUp = useCallback(
    async (articleId) => {
      setIsMovingOrder(true);
      try {
        await ArticlesApi.move(articleId, { direction: "up" });
        refresh();
      } catch (err) {
        console.error(err);
        setDeleteError(
          err?.response?.data?.message ??
            err?.message ??
            "Не удалось изменить порядок"
        );
        setSnackbarOpen(true);
      } finally {
        setIsMovingOrder(false);
      }
    },
    [refresh]
  );

  const handleMoveDown = useCallback(
    async (articleId) => {
      setIsMovingOrder(true);
      try {
        await ArticlesApi.move(articleId, { direction: "down" });
        refresh();
      } catch (err) {
        console.error(err);
        setDeleteError(
          err?.response?.data?.message ??
            err?.message ??
            "Не удалось изменить порядок"
        );
        setSnackbarOpen(true);
      } finally {
        setIsMovingOrder(false);
      }
    },
    [refresh]
  );

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Box sx={styles.headerContainer}>
        <Box sx={styles.header}>
          <Typography variant="h5" sx={styles.title}>
            Статьи
          </Typography>
          {total > 0 && (
            <Chip
              label={total}
              size="small"
              sx={styles.chip}
            />
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
          Создать статью
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={styles.errorAlert}>
          {error}
        </Alert>
      )}

      <ArticleBulkActions
        selectedCount={selectedArticles.length}
        onBulkDelete={handleBulkDelete}
        onBulkPublish={handleBulkPublish}
        onBulkUnpublish={handleBulkUnpublish}
      />

      {loading ? (
        <Box sx={styles.loadingBox}>
          <Typography>Загрузка...</Typography>
        </Box>
      ) : articles.length === 0 ? (
        <Box sx={styles.emptyBox}>
          <Typography color="text.secondary">
            Статьи не созданы
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={styles.tableContainer}>
            <ArticleTable
              articles={articles}
              loading={loading}
              selectedArticles={selectedArticles}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isMovingOrder={isMovingOrder}
            />
          </Box>
          <TablePagination
            total={total}
            page={page}
            rowsPerPage={rowsPerPage}
            itemsCount={articles.length}
            itemLabel="статья"
            itemLabelPlural="статей"
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
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
          <ArticleForm
            key={editingId || 'create'}
            id={editingId}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        </Box>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDeleteConfirm}
        itemName={articleToDelete?.name || ""}
        message="Вы уверены, что хотите удалить статью?"
        warningMessage="Это действие нельзя отменить."
        isDeleting={isDeleting}
      />

      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onClose={handleBulkDeleteDialogClose}
        onConfirm={handleBulkDeleteConfirm}
        itemName={
          selectedArticles.length > 0
            ? `${selectedArticles.length} статей`
            : ""
        }
        message="Вы уверены, что хотите удалить выбранные статьи?"
        warningMessage="Это действие нельзя отменить. Все выбранные статьи будут безвозвратно удалены."
        isDeleting={isBulkActioning}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {deleteError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={publishSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleClosePublishSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClosePublishSnackbar}
          severity={publishError ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {publishError || "Статья успешно опубликована"}
        </Alert>
      </Snackbar>

      <Snackbar
        open={unpublishSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseUnpublishSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseUnpublishSnackbar}
          severity={unpublishError ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {unpublishError || "Статья успешно снята с публикации"}
        </Alert>
      </Snackbar>

      <Snackbar
        open={bulkActionSnackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseBulkActionSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseBulkActionSnackbar}
          severity={bulkActionError ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {bulkActionError || "Успешно"}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

