import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  TextField,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { PollService, TPoll } from "@/services/poll";
import { DBService } from "@/services/db";
import { where } from "firebase/firestore";
import AddIcon from "@mui/icons-material/Add";
import { useAuthListener } from "@/hooks/useAuth";
import { Tables } from "@/constants";

export default function PollsPage() {
  const authUser = useAuthListener();
  const [polls, setPolls] = useState<TPoll[]>([]);
  const [selectedPoll, setSelectedPoll] = useState<TPoll | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPoll, setNewPoll] = useState({
    title: "",
    description: "",
    options: [""],
    expires_at: "",
  });

  const getPolls = async () => {
    const activePolls = await PollService.listActive(authUser!.uid);
    setPolls(activePolls);
  };

  const handlePollClick = async (poll: TPoll) => {
    const votes = await DBService.readAll({
      table: Tables.Votes,
      queries: [where("poll_id", "==", poll.id)],
    });

    const optionsWithVotes = poll.options.map((option) => ({
      ...option,
      votes: votes.filter((vote: any) => vote.option_id === option.id).length,
    }));

    setSelectedPoll({ ...poll, options: optionsWithVotes });
    setIsModalOpen(true);
  };

  const handleAddOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ""] });
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({ ...newPoll, options: updatedOptions });
  };

  const handleCreatePoll = async () => {
    const { title, description, options, expires_at } = newPoll;
    await PollService.create({
      condominium_id: authUser!.uid,
      title,
      description,
      options: options.map((option) => ({
        id: crypto.randomUUID(),
        text: option,
      })),
      expires_at,
    });

    setNewPoll({ title: "", description: "", options: [""], expires_at: "" });
    getPolls();
  };

  useEffect(() => {
    if (!authUser?.uid) return;
    getPolls();
  }, [authUser]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3}>
        Enquetes
      </Typography>

      <List>
        {polls.map((poll) => (
          <ListItem key={poll.id} onClick={() => handlePollClick(poll)}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <ListItemText primary={poll.title} secondary={poll.description} />
              <Typography>Ativo: {poll.is_active ? "Sim" : "Não"}</Typography>
            </Box>
          </ListItem>
        ))}
      </List>

      <Typography variant="h5" mt={4}>
        Criar Nova Enquete
      </Typography>

      <TextField
        label="Título"
        value={newPoll.title}
        onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Descrição"
        value={newPoll.description}
        onChange={(e) =>
          setNewPoll({ ...newPoll, description: e.target.value })
        }
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Expira em"
        type="date"
        value={newPoll.expires_at}
        onChange={(e) => setNewPoll({ ...newPoll, expires_at: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />

      {newPoll.options.map((option, index) => (
        <TextField
          key={index}
          label={`Opção ${index + 1}`}
          value={option}
          onChange={(e) => handleOptionChange(index, e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
      ))}

      <Button
        onClick={handleAddOption}
        startIcon={<AddIcon />}
        variant="outlined"
      >
        Adicionar Opção
      </Button>

      <Button
        onClick={handleCreatePoll}
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        Criar Enquete
      </Button>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box sx={{ p: 4, backgroundColor: "white", margin: "auto", mt: 10 }}>
          <Typography variant="h5">{selectedPoll?.title}</Typography>
          <Typography>{selectedPoll?.description}</Typography>

          <List>
            {selectedPoll?.options.map((option) => (
              <ListItem key={option.id}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <ListItemText primary={option.text} />
                  <Typography>{option.votes || 0} votos</Typography>
                </Box>
              </ListItem>
            ))}
          </List>

          <Typography>
            Total de Votos:{" "}
            {selectedPoll?.options.reduce(
              (sum, opt) => sum + (opt.votes || 0),
              0
            )}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
}
