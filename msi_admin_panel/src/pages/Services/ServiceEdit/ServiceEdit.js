import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { ServicesApi } from "../../../api/services.api";
import { BlockListItem } from "./components/BlockListItem";
import { AddBlockDialog } from "./components/AddBlockDialog";
import { DeleteBlockConfirmDialog } from "./components/DeleteBlockConfirmDialog";
import { BLOCK_TYPE_ORDER, BLOCK_TYPE_LABELS } from "./constants/blockTypes";
import { getEmptyPayload } from "./components/BlockPayloadForm";
import { styles } from "./styles/ServiceEdit.styles";

export const ServiceEdit = () => {
  const { id } = useParams();
  const location = useLocation();
  const returnCategoryId = location.state?.returnCategoryId;
  const [service, setService] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addBlockOpen, setAddBlockOpen] = useState(false);
  const [addBlockType, setAddBlockType] = useState(null);
  const [editingInlineId, setEditingInlineId] = useState(null);
  const [addingBlock, setAddingBlock] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  const loadService = useCallback(async () => {
    if (!id) return [];
    setLoading(true);
    setError(null);
    try {
      const res = await ServicesApi.get(id);
      const data = res?.data ?? res;
      setService(data);
      const list = data?.blocks ?? [];
      const nextBlocks = Array.isArray(list) ? [...list] : [];
      setBlocks(nextBlocks);
      return nextBlocks;
    } catch (err) {
      console.error(err);
      setError("Не удалось загрузить услугу");
      return [];
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  const handleAddBlock = (type, payload) => {
    return ServicesApi.addBlock(id, { type, payload }).then(loadService);
  };

  const handleAddBlockInline = async (type) => {
    setAddingBlock(true);
    setError(null);
    try {
      await ServicesApi.addBlock(id, { type, payload: getEmptyPayload(type) });
      const nextBlocks = await loadService();
      const last = nextBlocks[nextBlocks.length - 1];
      const newId = last?.serviceBlockId ?? last?.id;
      if (newId) setEditingInlineId(newId);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message ?? "Не удалось добавить блок");
    } finally {
      setAddingBlock(false);
    }
  };

  const handleSaveInline = (blockId, payload) => {
    return ServicesApi.updateBlock(id, blockId, { payload }).then(() => {
      setEditingInlineId(null);
      loadService();
    });
  };

  const handleDeleteBlock = async (blockId) => {
    await ServicesApi.removeBlock(id, blockId);
    setBlockToDelete(null);
    loadService();
  };

  const handleMoveBlock = useCallback(
    async (blockId, index, direction) => {
      if (index < 0 || index >= blocks.length) return;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= blocks.length) return;
      const reordered = [...blocks];
      const [removed] = reordered.splice(index, 1);
      reordered.splice(newIndex, 0, removed);
      const body = {
        blocks: reordered.map((b, i) => ({
          serviceBlockId: b.serviceBlockId ?? b.id,
          sortOrder: i,
        })),
      };
      setIsReordering(true);
      try {
        await ServicesApi.reorderBlocks(id, body);
        loadService();
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message ?? "Не удалось изменить порядок");
      } finally {
        setIsReordering(false);
      }
    },
    [id, blocks, loadService]
  );

  if (loading && !service) {
    return (
      <Paper elevation={0} sx={styles.paper}>
        <Box sx={styles.loadingBox}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!service) {
    return (
      <Paper elevation={0} sx={styles.paper}>
        <Alert severity="error">Услуга не найдена</Alert>
        <Button component={Link} to={returnCategoryId ? `/services?serviceCategoryId=${returnCategoryId}` : "/services"} sx={{ mt: 2 }}>
          К списку услуг
        </Button>
      </Paper>
    );
  }

  const serviceName = service.name ?? "Услуга";

  return (
    <Paper elevation={0} sx={styles.paper}>
      <Link to={returnCategoryId ? `/services?serviceCategoryId=${returnCategoryId}` : "/services"} style={{ textDecoration: "none" }}>
        <Box sx={styles.backLink} component="span">
          <ArrowBackIcon fontSize="small" /> К списку услуг
        </Box>
      </Link>

      <Box sx={styles.header}>
        <Typography variant="h5" sx={styles.title}>
          Конструктор: {serviceName}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={styles.errorAlert} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* <Typography variant="subtitle1" sx={styles.sectionTitle}>
        Контент страницы
      </Typography> */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Блоки отображаются так же, как на странице услуги. Нажмите «Редактировать» в карточке — блок станет редактируемым на месте, затем «Готово».
      </Typography>

      <Box sx={styles.typePanel}>
        <Typography variant="body2" color="text.secondary" sx={styles.typePanelLabel}>
          Добавить блок:
        </Typography>
        <Box sx={styles.typeButtons}>
          {BLOCK_TYPE_ORDER.map((blockType) => (
            <Button
              key={blockType}
              variant="outlined"
              size="small"
              disabled={addingBlock}
              onClick={() => handleAddBlockInline(blockType)}
              sx={styles.typeButton}
            >
              {BLOCK_TYPE_LABELS[blockType] ?? blockType}
            </Button>
          ))}
        </Box>
      </Box>

      <Box sx={styles.blocksContainer}>
        {blocks.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              Блоков пока нет. Нажмите тип блока выше — он появится здесь для редактирования.
            </Typography>
          </Box>
        ) : (
          blocks.map((block, index) => (
            <BlockListItem
              key={block.serviceBlockId ?? block.id ?? index}
              block={block}
              index={index}
              total={blocks.length}
              onMoveUp={(bid, i) => handleMoveBlock(bid, i, "up")}
              onMoveDown={(bid, i) => handleMoveBlock(bid, i, "down")}
              onEdit={(block) => setEditingInlineId(block.serviceBlockId ?? block.id)}
              onDelete={setBlockToDelete}
              isReordering={isReordering}
              isInlineEditing={editingInlineId === (block.serviceBlockId ?? block.id)}
              onSaveInline={handleSaveInline}
              onDoneInline={() => setEditingInlineId(null)}
            />
          ))
        )}
      </Box>

      <AddBlockDialog
        open={addBlockOpen}
        initialType={addBlockType}
        onClose={() => {
          setAddBlockOpen(false);
          setAddBlockType(null);
        }}
        onSuccess={() => {
          setAddBlockOpen(false);
          setAddBlockType(null);
          loadService();
        }}
        onAdd={handleAddBlock}
      />

      <DeleteBlockConfirmDialog
        open={!!blockToDelete}
        blockId={blockToDelete}
        onClose={() => setBlockToDelete(null)}
        onConfirm={() => blockToDelete && handleDeleteBlock(blockToDelete)}
      />
    </Paper>
  );
};
